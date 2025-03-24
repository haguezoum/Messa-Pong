import Auth from './Auth.js';

const routes = [
    {
      path: '/home',
      view: async () => {
      await import("../pages/home.js");
      return "<home-page></home-page>";
    }
     },
    {
      path: '/login',
      view: async () => {
      await import("../pages/login.js");
      return "<login-page></login-page>";
    }
     },
    {
      path: '/signup',
      view: async () => {
      await import("../pages/signup.js");
      return "<signup-page></signup-page>";
    }
     },
    {
      path: '/tfa',
      view: async () => {
      await import("../pages/towfa.js");
      return "<towfa-page></towfa-page>";
    }
     },
    {
      path: '/profile',
      view: async () => {
      await import('../pages/profile.js');
      return '<profile-page></profile-page>';
    }
     },
    {
      path: '/auth/callback',
      view: async () => {
        // Handle OAuth callback from 42
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        console.log("OAuth callback parameters:", {
          hasCode: !!code,
          codeLength: code ? code.length : 0,
          hasState: !!state,
          hasError: !!error,
          errorMessage: error || 'none'
        });
        
        if (error) {
          console.error("OAuth error:", error);
          // Set error in session storage for display on login page
          sessionStorage.setItem('oauth_error', error);
          // Redirect to login page
          setTimeout(() => {
            window.location.replace('/login');
          }, 100);
          return "<loading-progress></loading-progress>";
        }
        
        if (code) {
          console.log("OAuth callback received with code:", code);
          
          // Store the code in cookies and sessionStorage for redundancy
          Auth.setCookie('oauth_code', code, 1); // 1 day expiry
          Auth.setCookie('oauth_callback_timestamp', Date.now().toString(), 1);
          
          // Also keep in session storage as backup
          sessionStorage.setItem('oauth_code', code);
          sessionStorage.setItem('oauth_callback_timestamp', Date.now().toString());
          
          // This redirect approach is more reliable than window.location.href
          setTimeout(() => {
            window.location.replace('/home');
          }, 100);
        } else {
          console.error("OAuth callback missing code parameter");
          // Redirect to login page if something went wrong
          setTimeout(() => {
            window.location.replace('/login');
          }, 100);
        }
        
        // Return loading indicator while redirecting
        return "<loading-progress></loading-progress>";
      }
    },
    {
      path: '/',
      view: async () => {
      await import('../pages/entrypoint.js');
      return '<entrypoint-page></entrypoint-page>';
    },
     },
     {
      path: '/chat',
      view: async () => {
      await import('../pages/chat.js');
      return '<chat-page></chat-page>';
    }
     },
     {
      path: '/dashboard',
      view: async () => {
      await import('../pages/dashboard.js');
      return '<dashboard-page></dashboard-page>';
    }
     },
     {
      path: '/leaderboard',
      view: async () => {
      await import('../pages/leaderboard.js');
      return '<leaderboard-page></leaderboard-page>';
    }
     },
     {
      path: '/friendrequest',
      view: async () => {
      await import('../pages/friendrequest.js');
      return '<friendrequest-page></friendrequest-page>';
    }
     },
     {
      path: '/user',
      view: async () => {
      const userId = history.state? history.state : window.location.pathname.split('/')[2];
      await import('../pages/publicprofile.js');
      return `<user-profile-page user-id="${userId}"></user-profile-page>`;
    }
     },

  ]
export default routes;
