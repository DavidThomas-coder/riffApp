// App Constants
export const APP_NAME = 'Riff';

// Colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  white: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  border: '#E5E5EA',
  
  // Medal colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

// API Configuration
export const API_CONFIG = {
  baseURL: 'https://your-api-endpoint.com/api',
  timeout: 10000,
};

// App Settings
export const SETTINGS = {
  dailyResetTime: '04:00', // 4 AM UTC
  maxRiffLength: 500,
  minRiffLength: 10,
  maxUsernameLength: 20,
  minUsernameLength: 3,
  minPasswordLength: 6,
};

// Screen Names
export const SCREENS = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  CREATE: 'Create',
  LEADERBOARD: 'Leaderboard',
  PROFILE: 'Profile',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'authToken',
  LAST_PROMPT_DATE: 'lastPromptDate',
};