import api from '../utils/api.js';
import authUtils from '../utils/auth.js';

class Auth {
  static async loginWith42() {
    try {
      // Get the OAuth URL from the backend
      const response = await api.get('/api/auth/42/login/');
      if (response && response.authorization_url) {
        window.location.href = response.authorization_url;
        return true;
      }
      return false;
    } catch (error) {
      console.error('42 login error:', error);
      return false;
    }
  }

  static async isAuthenticated() {
    try {
      const token = authUtils.getAccessToken();
      if (!token) {
        console.log('No access token found');
        return false;
      }

      // Try to verify the token
      try {
        await api.post('/api/auth/verify/', { token });
        return true;
      } catch (error) {
        console.log('Auth: Token validation error:', error);
        
        // If token validation fails, try to refresh
        const refreshToken = authUtils.getRefreshToken();
        if (!refreshToken) {
          console.log('No refresh token found');
          return false;
        }

        try {
          const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
          if (response && response.access) {
            // Update the access token
            authUtils.updateAccessToken(response.access);
            return true;
          }
        } catch (refreshError) {
          console.log('Auth: Token refresh failed:', refreshError);
          // Clear tokens on refresh failure
          authUtils.clearTokens();
          return false;
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }

    return false;
  }

  static async requireAuth() {
    const isAuthed = await this.isAuthenticated();
    if (!isAuthed) {
      console.log('Auth: Not authenticated, redirecting to login');
      app.state.currentPage = '/login';
      return false;
    }
    return true;
  }

  static async logout() {
    try {
      // Call logout endpoint
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of logout success
      authUtils.clearTokens();
      // Redirect to login
      app.state.currentPage = '/login';
    }
  }

  static async handleOAuth42Callback(code, state) {
    try {
      console.log('Auth: Processing 42 OAuth callback');
      
      // Verify the state parameter to prevent CSRF attacks
      const savedState = localStorage.getItem('oauth_state');
      localStorage.removeItem('oauth_state'); // Clear state
      
      if (!state || state !== savedState) {
        console.error('Auth: OAuth state verification failed');
        return false;
      }
      
      // Exchange the authorization code for tokens
      const response = await api.post('/api/auth/42/callback/', {
        code: code
      });
      
      if (!response || !response.access) {
        console.error('Auth: Failed to exchange code for tokens');
        return false;
      }
      
      // Store tokens
      authUtils.setTokens(response.access, response.refresh);
      
      // Store user data if provided
      if (response.user) {
        authUtils.setUserData(response.user);
      }
      
      console.log('Auth: 42 OAuth authentication successful');
      return true;
    } catch (error) {
      console.error('Auth: 42 OAuth callback processing failed:', error);
      return false;
    }
  }
}

export default Auth; 