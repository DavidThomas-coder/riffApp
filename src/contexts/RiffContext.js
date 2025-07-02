import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit 
} from 'firebase/firestore';

const RiffContext = createContext();

export const useRiff = () => {
  const context = useContext(RiffContext);
  if (!context) {
    throw new Error('useRiff must be used within a RiffProvider');
  }
  return context;
};

export const RiffProvider = ({ children }) => {
  const { user } = useAuth();
  const [dailyPrompt, setDailyPrompt] = useState(null);
  const [todaysRiffs, setTodaysRiffs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTodaysData();
    }
  }, [user]);

  const loadTodaysData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's prompt
      const promptsRef = collection(db, 'prompts');
      const promptQuery = query(promptsRef, where('date', '==', today));
      const promptSnapshot = await getDocs(promptQuery);
      
      if (!promptSnapshot.empty) {
        const promptDoc = promptSnapshot.docs[0];
        setDailyPrompt({
          id: promptDoc.id,
          ...promptDoc.data(),
          resetTime: getNextResetTime(),
        });
      }

      // Get today's riffs
      const riffsRef = collection(db, 'riffs');
      const riffsQuery = query(
        riffsRef,
        where('date', '==', today),
        orderBy('createdAt', 'desc')
      );
      const riffsSnapshot = await getDocs(riffsQuery);
      
      const riffs = riffsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hasVoted: doc.data().votedUserIds?.includes(user.id) || false,
      }));
      
      setTodaysRiffs(riffs);

      // Update leaderboard
      const sortedRiffs = [...riffs].sort((a, b) => b.likes - a.likes);
      setLeaderboard(
        sortedRiffs.map((riff, index) => ({
          userId: riff.userId,
          username: riff.username,
          todayLikes: riff.likes,
          rank: index + 1,
          medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error('Failed to load today\'s data:', error);
      setLoading(false);
    }
  };

  const getNextResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(4, 0, 0, 0); // 4 AM UTC
    return tomorrow;
  };

  const createRiff = async (content) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user already has a riff today
      const today = new Date().toISOString().split('T')[0];
      const userRiffsRef = collection(db, 'riffs');
      const userRiffQuery = query(
        userRiffsRef,
        where('userId', '==', user.id),
        where('date', '==', today)
      );
      const userRiffSnapshot = await getDocs(userRiffQuery);

      if (!userRiffSnapshot.empty) {
        return { success: false, error: 'You can only submit one riff per day' };
      }

      const newRiff = {
        userId: user.id,
        username: user.displayName || user.email,
        content,
        likes: 0,
        createdAt: serverTimestamp(),
        date: today,
        hasBeenEdited: false,
        votedUserIds: [],
      };
      
      const docRef = await addDoc(collection(db, 'riffs'), newRiff);
      const riffWithId = { id: docRef.id, ...newRiff, hasVoted: false };
      
      setTodaysRiffs(prev => [riffWithId, ...prev]);
      return { success: true, riff: riffWithId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const editRiff = async (riffId, newContent) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const riffRef = doc(db, 'riffs', riffId);
      const riffDoc = await getDocs(riffRef);
      
      if (!riffDoc.exists()) {
        return { success: false, error: 'Riff not found' };
      }

      const riffData = riffDoc.data();
      
      if (riffData.userId !== user.id) {
        return { success: false, error: 'You can only edit your own riffs' };
      }

      if (riffData.hasBeenEdited) {
        return { success: false, error: 'You can only edit your riff once' };
      }

      if (riffData.votedUserIds?.length > 0) {
        return { success: false, error: 'Cannot edit riff after someone has voted on it' };
      }

      await updateDoc(riffRef, {
        content: newContent,
        hasBeenEdited: true
      });

      setTodaysRiffs(prev => 
        prev.map(r => 
          r.id === riffId 
            ? { ...r, content: newContent, hasBeenEdited: true }
            : r
        )
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const voteOnRiff = async (riffId, isUpvote) => {
    try {
      const riffRef = doc(db, 'riffs', riffId);
      const riffDoc = await getDocs(riffRef);
      
      if (!riffDoc.exists()) {
        throw new Error('Riff not found');
      }

      const riffData = riffDoc.data();
      
      if (riffData.userId === user?.id) {
        throw new Error('Cannot vote on your own riff');
      }

      const newVotedUserIds = isUpvote
        ? [...(riffData.votedUserIds || []), user.id]
        : (riffData.votedUserIds || []).filter(id => id !== user.id);

      const newLikes = isUpvote ? riffData.likes + 1 : Math.max(0, riffData.likes - 1);

      await updateDoc(riffRef, {
        likes: newLikes,
        votedUserIds: newVotedUserIds
      });

      setTodaysRiffs(prev => 
        prev.map(riff => {
          if (riff.id === riffId) {
            return { 
              ...riff, 
              likes: newLikes, 
              hasVoted: isUpvote,
              votedUserIds: newVotedUserIds
            };
          }
          return riff;
        })
      );

      // Update leaderboard
      const sortedRiffs = [...todaysRiffs].sort((a, b) => b.likes - a.likes);
      setLeaderboard(
        sortedRiffs.map((riff, index) => ({
          userId: riff.userId,
          username: riff.username,
          todayLikes: riff.likes,
          rank: index + 1,
          medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
        }))
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserRiffs = async (userId) => {
    try {
      const riffsRef = collection(db, 'riffs');
      const userRiffsQuery = query(
        riffsRef,
        where('userId', '==', userId || user.id),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const riffsSnapshot = await getDocs(userRiffsQuery);
      return riffsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Failed to get user riffs:', error);
      return [];
    }
  };

  const value = {
    dailyPrompt,
    todaysRiffs,
    leaderboard,
    loading,
    createRiff,
    editRiff,
    voteOnRiff,
    refreshData: loadTodaysData,
    getUserRiffs,
  };

  return (
    <RiffContext.Provider value={value}>
      {children}
    </RiffContext.Provider>
  );
};