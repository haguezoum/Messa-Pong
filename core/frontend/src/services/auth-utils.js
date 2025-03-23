/*
 * This file contains utility functions for authentication.
 * It provides functions to check if a user is authenticated,
 * get the current user, and handle OAuth login.
 */


class AuthUtils {
  static async isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  static async getAccessToken() {
    return localStorage.getItem('access_token');
  }

  static async getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  static async updateAccessToken(token) {
    localStorage.setItem('access_token', token);
  }

  static async updateRefreshToken(token) {
    localStorage.setItem('refresh_token', token);
  }

  static async clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  static async verifyToken(token) {
    const response = await api.post('/api/token/verify/', { token });
    return response.ok;
  }

  static async refreshToken() {
    const refreshToken = this.getRefreshToken();
    const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
    return response.ok;
  }

  static async getUserProfile() {
    const token = this.getAccessToken();
    const response = await api.get('/api/profile/', { Authorization: `Bearer ${token}` });
    return response.ok;
  }

  static async logout() {
    await this.clearTokens();
  }

  static async handle42Callback(code, state) {
    const response = await api.post('/api/auth/42/callback/', { code, state });
    return response.ok;
  }

  static async get42UserProfile(accessToken) {
    const response = await api.get('/api/auth/42/user-profile/', { Authorization: `Bearer ${accessToken}` });
    return response.ok;
  }
}
export default AuthUtils;