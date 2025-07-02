import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      // For now, use local storage instead of Firebase
      // TODO: Re-enable Firebase Firestore once the auth issue is resolved
      
      const today = new Date().toISOString().split('T')[0];
      
      // Load stored riffs
      const storedRiffs = await AsyncStorage.getItem('riffs');
      const allRiffs = storedRiffs ? JSON.parse(storedRiffs) : [];
      
      // Filter today's riffs
      const todaysRiffs = allRiffs.filter(riff => riff.date === today);
      setTodaysRiffs(todaysRiffs);

      // Create a simple daily prompt
      setDailyPrompt({
        id: 'local-prompt',
        text: 'Share your thoughts on today\'s challenge!',
        date: today,
        resetTime: getNextResetTime(),
      });

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

      // For now, use local storage instead of Firebase
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already has a riff today
      const storedRiffs = await AsyncStorage.getItem('riffs');
      const allRiffs = storedRiffs ? JSON.parse(storedRiffs) : [];
      const userRiffToday = allRiffs.find(riff => 
        riff.userId === user.id && riff.date === today
      );

      if (userRiffToday) {
        return { success: false, error: 'You can only submit one riff per day' };
      }

      const newRiff = {
        id: 'riff-' + Date.now(),
        userId: user.id,
        username: user.username,
        content,
        likes: 0,
        createdAt: new Date().toISOString(),
        date: today,
        hasBeenEdited: false,
        votedUserIds: [],
      };
      
      // Save to local storage
      const updatedRiffs = [...allRiffs, newRiff];
      await AsyncStorage.setItem('riffs', JSON.stringify(updatedRiffs));
      
      setTodaysRiffs(prev => [newRiff, ...prev]);
      return { success: true, riff: newRiff };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const editRiff = async (riffId, newContent) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // For now, use local storage instead of Firebase
      const storedRiffs = await AsyncStorage.getItem('riffs');
      const allRiffs = storedRiffs ? JSON.parse(storedRiffs) : [];
      const riffIndex = allRiffs.findIndex(riff => riff.id === riffId);
      
      if (riffIndex === -1) {
        return { success: false, error: 'Riff not found' };
      }

      const riff = allRiffs[riffIndex];
      
      if (riff.userId !== user.id) {
        return { success: false, error: 'You can only edit your own riffs' };
      }

      if (riff.hasBeenEdited) {
        return { success: false, error: 'You can only edit your riff once' };
      }

      if (riff.votedUserIds?.length > 0) {
        return { success: false, error: 'Cannot edit riff after someone has voted on it' };
      }

      // Update riff
      allRiffs[riffIndex] = {
        ...riff,
        content: newContent,
        hasBeenEdited: true
      };
      
      await AsyncStorage.setItem('riffs', JSON.stringify(allRiffs));

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
      // For now, use local storage instead of Firebase
      const storedRiffs = await AsyncStorage.getItem('riffs');
      const allRiffs = storedRiffs ? JSON.parse(storedRiffs) : [];
      const riffIndex = allRiffs.findIndex(riff => riff.id === riffId);
      
      if (riffIndex === -1) {
        throw new Error('Riff not found');
      }

      const riff = allRiffs[riffIndex];
      
      if (riff.userId === user?.id) {
        throw new Error('You cannot vote on your own riff');
      }

      const votedUserIds = riff.votedUserIds || [];
      
      if (votedUserIds.includes(user?.id)) {
        throw new Error('You have already voted on this riff');
      }

      const newVotedUserIds = [...votedUserIds, user?.id];
      const newLikes = isUpvote ? riff.likes + 1 : riff.likes - 1;

      // Update riff
      allRiffs[riffIndex] = {
        ...riff,
        likes: newLikes,
        votedUserIds: newVotedUserIds
      };
      
      await AsyncStorage.setItem('riffs', JSON.stringify(allRiffs));

      setTodaysRiffs(prev => 
        prev.map(r => 
          r.id === riffId 
            ? { ...r, likes: newLikes, hasVoted: true }
            : r
        )
      );

      // Update leaderboard
      const updatedRiffs = todaysRiffs.map(r => 
        r.id === riffId 
          ? { ...r, likes: newLikes }
          : r
      );
      
      const sortedRiffs = [...updatedRiffs].sort((a, b) => b.likes - a.likes);
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
      // For now, use local storage instead of Firebase
      const storedRiffs = await AsyncStorage.getItem('riffs');
      const allRiffs = storedRiffs ? JSON.parse(storedRiffs) : [];
      
      const userRiffs = allRiffs
        .filter(riff => riff.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      
      return userRiffs;
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
    getUserRiffs,
    loadTodaysData
  };

  return (
    <RiffContext.Provider value={value}>
      {children}
    </RiffContext.Provider>
  );
};