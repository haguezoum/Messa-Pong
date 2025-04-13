class Auth {
  // Cookie utility methods
  static setCookie(name, value, days = 1, path = '/') {
    console.log(`Setting cookie ${name} to ${value}`);
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=${path}; SameSite=Lax`;
    console.log(`Cookie ${name} set to ${value.substring(0, 10)}...`);
  }

  static getCookie(name) {
    console.log(`Getting cookie ${name}`);
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return null;
  }

  static deleteCookie(name, path = '/') {
    console.log(`Deleting cookie ${name}`);
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    console.log(`Cookie ${name} deleted`);
  }

  static logAuthState(message) {
    const state = {
      isAuthenticated: app.state.isAuthenticated,
      hasAccessToken: !!this.getCookie('accessToken'),
      hasRefreshToken: !!this.getCookie('refreshToken'),
      hasUserData: !!this.getCookie('userData'),
      hasAuthSuccess: !!this.getCookie('authSuccess'),
      oauthPending: !!this.getCookie('oauth_code'),
      currentPath: window.location.pathname,
      currentPage: app.state.currentPage
    };
    
    console.log(`Auth State [${message}]:`, state);
    return state;
  }

  static isAuthenticated() {
    console.log('Auth: Checking if user is authenticated');
    
    // Check for required cookies
    const accessToken = this.getCookie('accessToken');
    const refreshToken = this.getCookie('refreshToken');
    const userData = this.getCookie('userData');
    const authSuccess = this.getCookie('authSuccess');
    
    const result = {
      isAuthenticated: !!accessToken && !!refreshToken && !!userData,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!userData,
      hasAuthSuccess: !!authSuccess,
      oauthPending: !!this.getCookie('oauth_code'),
      currentPath: window.location.pathname,
      currentPage: app.state.currentPage
    };
    
    console.log('Auth: Authentication check result:', result);
    
    // Update app state
    if (app && app.state) {
      app.state.isAuthenticated = result.isAuthenticated;
    }
    
    return result.isAuthenticated;
  }

  static async loginWith42() {
    Auth.logAuthState('Before loginWith42');
    try {
      console.log('Auth: Initiating 42 login flow');
      
      // Log that we're redirecting to the 42 authorization endpoint to aid debugging
      const oauthUrl = '/api/oauth/42/login/';
      console.log('Auth: Redirecting to 42 authorization endpoint:', oauthUrl);
      Auth.logAuthState('Before redirect to 42');
      
      // For OAuth redirect, we must use window.location.href as it requires a full page load
      window.location.href = oauthUrl;
      return true;
    } catch (error) {
      console.error('Auth: 42 login error:', error);
      return false;
    }
  }

  static async checkAuthOnLoad() {
    Auth.logAuthState('Start of checkAuthOnLoad');
    try {
      console.log('Auth: checkAuthOnLoad called');
      const accessToken = this.getCookie('accessToken');
      const refreshToken = this.getCookie('refreshToken');
      const userData = this.getCookie('userData');

      console.log('Auth: Tokens from cookies:', { 
        hasAccessToken: !!accessToken, 
        accessTokenLength: accessToken ? accessToken.length : 0,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken ? refreshToken.length : 0,
        hasUserData: !!userData
      });

      // If the app state already knows we're authenticated and we have tokens,
      // trust that and avoid unnecessary verification
      if (app.state.isAuthenticated && accessToken && refreshToken) {
        console.log('Auth: Already authenticated according to app state');
        Auth.logAuthState('Already authenticated, skipping verification');
        return true;
      }

      if (!accessToken || !refreshToken) {
        console.log('Auth: Missing tokens in cookies');
        app.state.isAuthenticated = false;
        Auth.logAuthState('Missing tokens, not authenticated');
        return false;
      }

      try {
        // Verify token validity with backend - with timeout
        console.log('Auth: Verifying token with backend');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch('/api/auth/verify/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            console.log('Auth: Token verified successfully');
            app.state.isAuthenticated = true;
            Auth.logAuthState('Token verified successfully');
            return true;
          }

          console.log('Auth: Token verification failed, attempting refresh');
          
          // Token invalid, try refresh with timeout
          const refreshController = new AbortController();
          const refreshTimeoutId = setTimeout(() => refreshController.abort(), 5000);
          
          try {
            const refreshResponse = await fetch('/api/token/refresh/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ refresh: refreshToken }),
              credentials: 'include',
              signal: refreshController.signal
            });

            clearTimeout(refreshTimeoutId);

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              console.log('Auth: Token refreshed successfully');
              this.setCookie('accessToken', data.access);
              app.state.isAuthenticated = true;
              Auth.logAuthState('Token refreshed successfully');
              return true;
            }

            console.log('Auth: Token refresh failed, user is not authenticated');
            app.state.isAuthenticated = false;
            Auth.logAuthState('Token refresh failed, not authenticated');
            return false;
          } catch (refreshError) {
            clearTimeout(refreshTimeoutId);
            console.error('Auth: Token refresh error:', refreshError);
            
            // For network errors or timeouts, assume authenticated if we have tokens
            // This prevents logout loops due to temporary API issues
            if (refreshError.name === 'AbortError' || refreshError.name === 'TypeError') {
              console.log('Auth: Network error during refresh, assuming still authenticated');
              app.state.isAuthenticated = true;
              Auth.logAuthState('Network error during refresh, assuming still authenticated');
              return true;
            }
            
            Auth.logAuthState('Token refresh failed, not authenticated');
            return false;
          }
        } catch (verifyError) {
          clearTimeout(timeoutId);
          console.error('Auth: Token verification error:', verifyError);
          
          // For network errors or timeouts, assume authenticated if we have tokens
          // This prevents logout loops due to temporary API issues
          if (verifyError.name === 'AbortError' || verifyError.name === 'TypeError') {
            console.log('Auth: Network error during verification, assuming still authenticated');
            app.state.isAuthenticated = true;
            Auth.logAuthState('Network error during verification, assuming still authenticated');
            return true;
          }
          
          Auth.logAuthState('Token verification failed, not authenticated');
          return false;
        }
      } catch (error) {
        console.error('Auth: Error during token verification process:', error);
        // Don't clear tokens on network errors - might be temporary
        Auth.logAuthState('Error in token verification process');
        return false;
      }
    } catch (error) {
      console.error('Auth: Critical error in checkAuthOnLoad:', error);
      Auth.logAuthState('Error in checkAuthOnLoad');
      return false;
    } finally {
      Auth.logAuthState('End of checkAuthOnLoad');
    }
  }

  static async logout() {
    Auth.logAuthState('Before logout');
    try {
      console.log('Auth: Logging out user');
      
      // Call logout endpoint if we have an access token
      const accessToken = this.getCookie('accessToken');
      if (accessToken) {
        try {
          await fetch('/api/logout/', { 
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include'
          });
          console.log('Auth: Server logout successful');
        } catch (error) {
          console.error('Auth: Server logout error, proceeding with local logout:', error);
        }
      }
    } catch (error) {
      console.error('Auth: Logout error:', error);
    } finally {
      console.log('Auth: Clearing authentication data from cookies');
      // Clear tokens regardless of logout success
      this.deleteCookie('accessToken');
      this.deleteCookie('refreshToken');
      this.deleteCookie('userData');
      this.deleteCookie('authSuccess');
      this.deleteCookie('oauth_code');
      this.deleteCookie('oauth_callback_timestamp');
      
      // Update authentication state
      app.state.isAuthenticated = false;
      
      Auth.logAuthState('After logout');
      
      // Navigate to login page using SPA navigation
      console.log('Auth: Redirecting to login page');
      window.dispatchEvent(new CustomEvent('stateChanged', {
        detail: { key: 'currentPage', value: '/login' }
      }));
    }
  }

  static direct42Login() {
    Auth.logAuthState('Direct 42 login attempt');
    try {
      // Explicitly log the URL we're redirecting to
      const oauthUrl = '/api/oauth/42/login/';
      console.log('Auth: Redirecting to 42 OAuth URL:', oauthUrl);
      
      // For better debugging - set a flag in sessionStorage
      sessionStorage.setItem('oauth_redirect_attempt', Date.now().toString());
      
      // Use the full URL format for more reliability
      const fullUrl = new URL(oauthUrl, window.location.origin).href;
      console.log('Auth: Full redirect URL:', fullUrl);
      
      window.location.href = fullUrl;
      return true;
    } catch (error) {
      console.error('Auth: Error during direct 42 login:', error);
      // Try a backup approach as a last resort
      try {
        window.location.href = '/api/oauth/42/login/';
        return true;
      } catch (backupError) {
        console.error('Auth: Backup redirect also failed:', backupError);
        return false;
      }
    }
  }
}

export default Auth; 