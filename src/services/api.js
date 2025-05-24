import { API_CONFIG } from '../utils/constants';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, username) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateUserProfile(userId, updates) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Riff endpoints
  async getDailyPrompt(date) {
    return this.request(`/prompts/daily?date=${date}`);
  }

  async getTodaysRiffs(date) {
    return this.request(`/riffs?date=${date}`);
  }

  async createRiff(content, promptId) {
    return this.request('/riffs', {
      method: 'POST',
      body: JSON.stringify({ content, promptId }),
    });
  }

  async voteOnRiff(riffId, isUpvote) {
    return this.request(`/riffs/${riffId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ isUpvote }),
    });
  }

  async getUserRiffs(userId, date) {
    return this.request(`/users/${userId}/riffs?date=${date}`);
  }

  // Leaderboard endpoints
  async getDailyLeaderboard(date) {
    return this.request(`/leaderboard/daily?date=${date}`);
  }

  async getWeeklyLeaderboard(weekStart) {
    return this.request(`/leaderboard/weekly?week=${weekStart}`);
  }

  async getMonthlyLeaderboard(month, year) {
    return this.request(`/leaderboard/monthly?month=${month}&year=${year}`);
  }

  // Medal endpoints
  async getUserMedals(userId) {
    return this.request(`/users/${userId}/medals`);
  }

  async getMedalHistory(userId) {
    return this.request(`/users/${userId}/medals/history`);
  }
}

export default new ApiService();