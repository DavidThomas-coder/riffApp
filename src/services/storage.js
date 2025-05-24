import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return { success: true };
    } catch (error) {
      console.error('Storage setItem error:', error);
      return { success: false, error: error.message };
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return { success: false, error: error.message };
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      console.error('Storage clear error:', error);
      return { success: false, error: error.message };
    }
  }

  // User-specific methods
  async saveUser(userData) {
    return this.setItem(STORAGE_KEYS.USER, userData);
  }

  async getUser() {
    return this.getItem(STORAGE_KEYS.USER);
  }

  async removeUser() {
    return this.removeItem(STORAGE_KEYS.USER);
  }

  // Auth token methods
  async saveAuthToken(token) {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken() {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken() {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // App state methods
  async saveLastPromptDate(date) {
    return this.setItem(STORAGE_KEYS.LAST_PROMPT_DATE, date);
  }

  async getLastPromptDate() {
    return this.getItem(STORAGE_KEYS.LAST_PROMPT_DATE);
  }

  // Offline data caching
  async cacheRiffs(date, riffs) {
    const key = `riffs_${date}`;
    return this.setItem(key, {
      data: riffs,
      timestamp: Date.now(),
    });
  }

  async getCachedRiffs(date) {
    const key = `riffs_${date}`;
    const cached = await this.getItem(key);
    
    if (!cached) return null;
    
    // Check if cache is still valid (24 hours)
    const isValid = Date.now() - cached.timestamp < 24 * 60 * 60 * 1000;
    
    return isValid ? cached.data : null;
  }

  async cacheLeaderboard(date, leaderboard) {
    const key = `leaderboard_${date}`;
    return this.setItem(key, {
      data: leaderboard,
      timestamp: Date.now(),
    });
  }

  async getCachedLeaderboard(date) {
    const key = `leaderboard_${date}`;
    const cached = await this.getItem(key);
    
    if (!cached) return null;
    
    // Check if cache is still valid (1 hour)
    const isValid = Date.now() - cached.timestamp < 60 * 60 * 1000;
    
    return isValid ? cached.data : null;
  }

  // User preferences
  async saveUserPreferences(preferences) {
    return this.setItem('user_preferences', preferences);
  }

  async getUserPreferences() {
    const defaultPreferences = {
      notifications: true,
      dailyReminders: true,
      soundEnabled: true,
      theme: 'light',
    };
    
    const saved = await this.getItem('user_preferences');
    return { ...defaultPreferences, ...saved };
  }

  // App analytics/stats
  async incrementAppOpens() {
    const current = await this.getItem('app_opens') || 0;
    return this.setItem('app_opens', current + 1);
  }

  async getAppOpens() {
    return this.getItem('app_opens') || 0;
  }

  async saveLastActiveDate() {
    return this.setItem('last_active', new Date().toISOString());
  }

  async getLastActiveDate() {
    return this.getItem('last_active');
  }
}

export default new StorageService();