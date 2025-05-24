import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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
      
      // Mock daily prompts
      const prompts = [
        "What's the most ridiculous solution to climate change you can think of?",
        "If you could add one completely useless feature to smartphones, what would it be?",
        "What's the worst possible name for a luxury hotel?",
        "How would you explain the internet to someone from the 1800s?",
        "What's the most awkward superpower you could have?",
        "If animals could leave Yelp reviews for humans, what would they say?",
        "What would be the worst product to add 'smart' technology to?"
      ];
      
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const promptIndex = dayOfYear % prompts.length;
      
      setDailyPrompt({
        id: `prompt_${today}`,
        text: prompts[promptIndex],
        date: today,
        resetTime: getNextResetTime(),
      });

      // Mock riffs data - now with editing tracking
      setTodaysRiffs([
        {
          id: 'riff1',
          userId: 'user456',
          username: 'comedygold',
          content: "Giant fans to blow all the hot air to space. We'll call it the 'Cool Earth Down' project and charge $1 per breath of fresh air!",
          likes: 42,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          hasVoted: false,
          hasBeenEdited: false,
          votedUserIds: ['user789', 'user101'], // Track who voted
        },
        {
          id: 'riff2',
          userId: 'user789',
          username: 'jokester',
          content: "Mandatory dad jokes at every factory - the collective groaning will create enough wind power to replace fossil fuels entirely!",
          likes: 38,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          hasVoted: true,
          hasBeenEdited: true,
          votedUserIds: ['user456', 'user101'],
        },
        {
          id: 'riff3',
          userId: 'user101',
          username: 'riffmaster',
          content: "Train all cows to hold their breath. Problem solved! We'll call it the 'Bovine Breath Control Initiative'.",
          likes: 25,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          hasVoted: false,
          hasBeenEdited: false,
          votedUserIds: ['user456'],
        },
      ]);

      // Generate leaderboard from riffs
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

      // Check if user already has a riff today
      const userTodayRiff = todaysRiffs.find(riff => riff.userId === user.id);
      if (userTodayRiff) {
        return { success: false, error: 'You can only submit one riff per day' };
      }

      const newRiff = {
        id: `riff_${Date.now()}`,
        userId: user.id,
        username: user.username,
        content,
        likes: 0,
        createdAt: new Date().toISOString(),
        hasVoted: false,
        hasBeenEdited: false,
        votedUserIds: [],
      };
      
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

      const riff = todaysRiffs.find(r => r.id === riffId);
      if (!riff) {
        return { success: false, error: 'Riff not found' };
      }

      if (riff.userId !== user.id) {
        return { success: false, error: 'You can only edit your own riffs' };
      }

      if (riff.hasBeenEdited) {
        return { success: false, error: 'You can only edit your riff once' };
      }

      if (riff.votedUserIds.length > 0) {
        return { success: false, error: 'Cannot edit riff after someone has voted on it' };
      }

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
      setTodaysRiffs(prev => 
        prev.map(riff => {
          if (riff.id === riffId && riff.userId !== user?.id) {
            const newLikes = isUpvote ? riff.likes + 1 : Math.max(0, riff.likes - 1);
            const newVotedUserIds = isUpvote 
              ? [...riff.votedUserIds, user.id]
              : riff.votedUserIds.filter(id => id !== user.id);
            
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
      setTimeout(() => {
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
      }, 100);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserRiffs = () => {
    if (!user) return [];
    return todaysRiffs.filter(riff => riff.userId === user.id);
  };

  const getUserRiffHistory = async (userId) => {
    try {
      // Mock riff history - in real app, fetch from API
      const mockHistory = [
        {
          id: 'riff_hist_1',
          userId: userId,
          content: "Giant hamster wheels to power entire cities. We'll call it 'Rodent Renewable Energy'!",
          likes: 23,
          createdAt: '2025-05-23T10:30:00Z',
          prompt: "What's the most ridiculous solution to climate change you can think of?",
        },
        {
          id: 'riff_hist_2',
          userId: userId,
          content: "A smartphone feature that judges your life choices and sighs disappointedly.",
          likes: 45,
          createdAt: '2025-05-22T14:15:00Z',
          prompt: "If you could add one completely useless feature to smartphones, what would it be?",
        },
        {
          id: 'riff_hist_3',
          userId: userId,
          content: "The Regret Inn - where every room comes with a mirror that shows your worst decisions.",
          likes: 12,
          createdAt: '2025-05-21T09:45:00Z',
          prompt: "What's the worst possible name for a luxury hotel?",
        },
      ];

      // Sort by most recent first
      return mockHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get user riff history:', error);
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
    getUserRiffHistory,
  };

  return (
    <RiffContext.Provider value={value}>
      {children}
    </RiffContext.Provider>
  );
};