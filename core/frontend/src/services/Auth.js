import api from './API.js';
import authUtils from './auth-utils.js';

class Auth {
  static getRedirectUri() {
    // Get the current protocol and host
    const protocol = window.location.protocol;
    const host = window.location.host || 'localhost'; // fallback to default IP if host is not available
    return `${protocol}//${host}/auth/callback/`;
  }

  static OAUTH_CONFIG = {
    CLIENT_ID: 'u-s4t2ud-39a03dbd1fcf1c3dcba865c1fa057d33b395acb25289ad6c9f208a7610a43155',
    // Use our backend endpoint for handling OAuth
    REDIRECT_URI: 'https://127.0.0.1/api/auth/42/callback/',
    AUTHORIZE_URL: 'https://api.intra.42.fr/oauth/authorize'
  };

  static async loginWith42() {
    try {
      // Generate and store state for CSRF protection
      const state = Math.random().toString(36).substring(7);
      localStorage.setItem('oauth_state', state);

      // Store the current URL to return to after auth
      localStorage.setItem('pre_auth_url', window.location.href);

      // Construct the authorization URL with encoded redirect URI
      const params = new URLSearchParams({
        client_id: this.OAUTH_CONFIG.CLIENT_ID,
        redirect_uri: this.OAUTH_CONFIG.REDIRECT_URI,
        response_type: 'code',
        state: state,
        scope: 'public'
      });

      // Redirect to 42's OAuth page
      const authUrl = `${this.OAUTH_CONFIG.AUTHORIZE_URL}?${params.toString()}`;
      window.location.replace(authUrl);
      return true;
    } catch (error) {
      console.error('42 login error:', error);
      return false;
    }
  }

  static async isAuthenticated() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token found');
        return false;
      }

      // Try to verify the token
      try {
        const response = await api.get('/api/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return !!response;
      } catch (error) {
        console.log('Auth: Token validation error:', error);
        
        // If token validation fails, try to refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log('No refresh token found');
          return false;
        }

        try {
          const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
          if (response && response.access) {
            // Update the access token
            localStorage.setItem('access_token', response.access);
            return true;
          }
        } catch (refreshError) {
          console.log('Auth: Token refresh failed:', refreshError);
          // Clear tokens on refresh failure
          this.clearTokens();
          return false;
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
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
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      window.location.replace('/login');
    }
  }

  static async handle42Callback(code, state) {
    try {
      console.log('Auth: Processing 42 OAuth callback');
      
      // Verify the state parameter to prevent CSRF attacks
      const savedState = localStorage.getItem('oauth_state');
      localStorage.removeItem('oauth_state'); // Clear state
      
      if (!state || state !== savedState) {
        console.error('Auth: OAuth state verification failed');
        return false;
      }

      // First, exchange the code for an access token directly with 42's API
      const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: this.OAUTH_CONFIG.CLIENT_ID,
          client_secret: this.OAUTH_CONFIG.CLIENT_SECRET,
          code: code,
          redirect_uri: this.OAUTH_CONFIG.REDIRECT_URI,
          state: state
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        console.error('Auth: Failed to get access token from 42');
        return false;
      }

      // Now get the user profile with the access token
      const userProfile = await this.get42UserProfile(tokenData.access_token);
      
      // Send the profile data to your backend
      const response = await api.post('/api/auth/42/callback/', {
        code: code,
        access_token: tokenData.access_token,
        profile: userProfile,
        redirect_uri: this.OAUTH_CONFIG.REDIRECT_URI
      });
      
      if (!response || !response.access) {
        console.error('Auth: Failed to exchange code for tokens');
        return false;
      }
      
      // Store tokens and user data
      authUtils.setTokens(response.access, response.refresh);
      if (response.user) {
        authUtils.setUserData({
          ...response.user,
          ...userProfile
        });
      }
      
      console.log('Auth: 42 OAuth authentication successful');

      // Get the URL to return to
      const returnUrl = localStorage.getItem('pre_auth_url') || '/home';
      localStorage.removeItem('pre_auth_url'); // Clean up

      // Use window.location.replace for the final redirect
      window.location.replace('/home');
      return true;
    } catch (error) {
      console.error('Auth: 42 OAuth callback processing failed:', error);
      window.location.replace('/login');
      return false;
    }
  }

  static async get42UserProfile(accessToken) {
    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return {
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        image_url: data.image_url,
        login: data.login
      };
    } catch (error) {
      console.error('Error fetching 42 user profile:', error);
      throw error;
    }
  }

  static clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }
}

export default Auth; 