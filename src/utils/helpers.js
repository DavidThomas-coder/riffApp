// Date and Time Helpers
export const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };
  
  export const getNextResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(4, 0, 0, 0); // 4 AM UTC
    return tomorrow;
  };
  
  export const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  // Text Helpers
  export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };
  
  export const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Validation Helpers
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };
  
  export const validatePassword = (password) => {
    return password.length >= 6;
  };
  
  export const validateRiffContent = (content) => {
    const trimmed = content.trim();
    return trimmed.length >= 10 && trimmed.length <= 500;
  };
  
  // Array Helpers
  export const sortByLikes = (riffs) => {
    return [...riffs].sort((a, b) => b.likes - a.likes);
  };
  
  export const groupByDate = (items) => {
    return items.reduce((groups, item) => {
      const date = new Date(item.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
  };
  
  // Medal Helpers
  export const getMedalForRank = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return null;
  };
  
  export const getMedalEmoji = (medal) => {
    switch (medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return null;
    }
  };
  
  // Random Helpers
  export const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };
  
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Platform Helpers
  export const isIOS = () => {
    return Platform.OS === 'ios';
  };
  
  export const isAndroid = () => {
    return Platform.OS === 'android';
  };