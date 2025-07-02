import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

const RiffContext = createContext();

export const useRiff = () => {
  const context = useContext(RiffContext);
  if (!context) {
    throw new Error('useRiff must be used within a RiffProvider');
  }
  return context;
};

// Daily prompts array
const DAILY_PROMPTS = [
  "What's the most interesting thing you learned today?",
  "Share a moment that made you smile today.",
  "What's something you're looking forward to this week?",
  "Describe a challenge you overcame recently.",
  "What's your favorite way to spend a free afternoon?",
  "Share a piece of advice you'd give to your younger self.",
  "What's something that always cheers you up?",
  "Describe your perfect weekend in three words.",
  "What's a skill you'd love to learn?",
  "Share a quote that inspires you.",
  "What's the best compliment you've ever received?",
  "Describe a place that feels like home to you.",
  "What's something you're grateful for today?",
  "Share a small victory from this week.",
  "What's your favorite way to practice self-care?",
  "Describe a book, movie, or song that changed your perspective.",
  "What's something you're curious about lately?",
  "Share a tradition that's important to you.",
  "What's the most beautiful thing you've seen today?",
  "Describe your ideal morning routine.",
  "What's something that always makes you laugh?",
  "Share a goal you're working towards.",
  "What's your favorite season and why?",
  "Describe a person who inspires you.",
  "What's something you're passionate about?",
  "Share a memory that makes you happy.",
  "What's your favorite way to connect with others?",
  "Describe a moment when you felt proud of yourself.",
  "What's something you'd like to improve about yourself?",
  "Share a lesson you learned the hard way."
];

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

  const getDailyPrompt = (date) => {
    // Use the date to generate a consistent prompt for each day
    const dateObj = new Date(date);
    const dayOfYear = Math.floor((dateObj - new Date(dateObj.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const promptIndex = dayOfYear % DAILY_PROMPTS.length;
    return DAILY_PROMPTS[promptIndex];
  };

  const loadTodaysData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's riffs from Supabase
      const { data: riffs, error } = await supabase
        .from('riffs')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading riffs:', error);
        setTodaysRiffs([]);
      } else {
        // Add hasVoted property for current user
        const riffsWithVoteStatus = riffs.map(riff => ({
          ...riff,
          hasVoted: riff.voted_user_ids?.includes(user?.id) || false,
        }));
        setTodaysRiffs(riffsWithVoteStatus || []);
      }

      // Create a proper daily prompt
      const promptText = getDailyPrompt(today);
      setDailyPrompt({
        id: 'prompt-' + today,
        text: promptText,
        date: today,
        resetTime: getNextResetTime(),
      });

      // Update leaderboard
      const sortedRiffs = [...(riffs || [])].sort((a, b) => b.likes - a.likes);
      setLeaderboard(
        sortedRiffs.map((riff, index) => ({
          userId: riff.user_id,
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

      const today = new Date().toISOString().split('T')[0];
      
      // Check if user already has a riff today
      const { data: existingRiff, error: checkError } = await supabase
        .from('riffs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { success: false, error: 'Error checking existing riff' };
      }

      if (existingRiff) {
        return { success: false, error: 'You can only submit one riff per day' };
      }

      // Create new riff
      const { data: newRiff, error: insertError } = await supabase
        .from('riffs')
        .insert([
          {
            user_id: user.id,
            username: user.username,
            content,
            likes: 0,
            date: today,
            has_been_edited: false,
            voted_user_ids: [],
          }
        ])
        .select()
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      const riffWithVoteStatus = {
        ...newRiff,
        hasVoted: false,
      };

      setTodaysRiffs(prev => [riffWithVoteStatus, ...prev]);
      return { success: true, riff: riffWithVoteStatus };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const editRiff = async (riffId, newContent) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the riff first
      const { data: riff, error: fetchError } = await supabase
        .from('riffs')
        .select('*')
        .eq('id', riffId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Riff not found' };
      }

      if (riff.user_id !== user.id) {
        return { success: false, error: 'You can only edit your own riffs' };
      }

      if (riff.has_been_edited) {
        return { success: false, error: 'You can only edit your riff once' };
      }

      if (riff.voted_user_ids?.length > 0) {
        return { success: false, error: 'Cannot edit riff after someone has voted on it' };
      }

      // Update the riff
      const { error: updateError } = await supabase
        .from('riffs')
        .update({
          content: newContent,
          has_been_edited: true
        })
        .eq('id', riffId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      setTodaysRiffs(prev => 
        prev.map(r => 
          r.id === riffId 
            ? { ...r, content: newContent, has_been_edited: true }
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
      // Get the riff first
      const { data: riff, error: fetchError } = await supabase
        .from('riffs')
        .select('*')
        .eq('id', riffId)
        .single();

      if (fetchError) {
        throw new Error('Riff not found');
      }

      if (riff.user_id === user?.id) {
        throw new Error('You cannot vote on your own riff');
      }

      const votedUserIds = riff.voted_user_ids || [];
      
      if (votedUserIds.includes(user?.id)) {
        throw new Error('You have already voted on this riff');
      }

      const newVotedUserIds = [...votedUserIds, user?.id];
      const newLikes = isUpvote ? riff.likes + 1 : riff.likes - 1;

      // Update the riff
      const { error: updateError } = await supabase
        .from('riffs')
        .update({
          likes: newLikes,
          voted_user_ids: newVotedUserIds
        })
        .eq('id', riffId);

      if (updateError) {
        throw new Error(updateError.message);
      }

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
          userId: riff.user_id,
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
      const { data: riffs, error } = await supabase
        .from('riffs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to get user riffs:', error);
        return [];
      }

      return riffs || [];
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