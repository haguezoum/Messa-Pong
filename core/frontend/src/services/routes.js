
const routes = [
    {
      path: '/home',
      view: async () => { await import("../pages/home.js"); return "<home-page></home-page>"; }
     },
    {
      path: '/login',
      view: async () => { await import("../pages/login.js"); return "<login-page></login-page>"; }
     },
    {
      path: '/signup',
      view: async () => { await import("../pages/signup.js"); return "<signup-page></signup-page>"; }
     },
    {
      path: '/tfa',
      view: async () => { await import("../pages/towfa.js"); return "<towfa-page></towfa-page>"; }
     },
    {
      path: '/settings',
      view: async () => { await import("../pages/settings.js"); return "<settings-page></settings-page>"; }
     },
    {
      path: '/oauth-callback',
      view: async () => {
      await import("../pages/login.js");
      const urlParams = new URLSearchParams(window.location.search);
      const refresh = urlParams.get("refresh");
      const access = urlParams.get("access");
      const provider = urlParams.get("provider");

      console.log("OAuth callback parameters:", { refresh, access, provider });

      if (refresh && access && provider) {
        const LoginPage = await import("../pages/login.js").then(module => module.default);
        LoginPage.storeTokens(refresh, access);
        setTimeout(() => {
          window.history.replaceState(null, null, "/home");
          window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/home" } }));
        }, 100);
      } else {
        console.error("Missing OAuth parameters");
        setTimeout(() => {
          window.history.replaceState(null, null, "/login");
          window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/login" } }));
        }, 100);
      }
      return "<loading-progress></loading-progress>";
    }
     },
    {
      path: '/',
      view: async () => { await import("../pages/entrypoint.js"); return "<entrypoint-page></entrypoint-page>"; }
     },
    {
      path: '/chat',
      view: async () => { await import("../pages/chat.js"); return "<chat-page></chat-page>"; }
     },
    {
      path: '/dashboard',
      view: async () => { await import("../pages/dashboard.js"); return "<dashboard-page></dashboard-page>"; }
     },
    {
      path: '/leaderboard',
      view: async () => { await import("../pages/leaderboard.js"); return "<leaderboard-page></leaderboard-page>"; }
     },
    {
      path: '/friendrequest',
      view: async () => { await import("../pages/friendrequest.js"); return "<friendrequest-page></friendrequest-page>"; }
     },
    {
      path: '/users/:username',
      view: async (params) => {
      try {
        await import("../pages/profile.js");
        console.log("Loading profile with username param:", params.username);
        return `<profile-page username="${params.username}"></profile-page>`;
      } catch (error) {
        console.error("Error loading profile with username:", error);
        return "<loading-progress></loading-progress>";
      }
    }
     },
    {
      path: '/users',
      view: async () => {
      try {
        await import("../pages/profile.js");
        console.log("Loading current user profile");
        return "<profile-page></profile-page>"; // Loads current user profile
      } catch (error) {
        console.error("Error loading user profile:", error);
        return "<loading-progress></loading-progress>";
      }
    }
     },
    {
      path: '/profile',
      view: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("id");
      if (userId) {
        try {
          const response = await fetch(`https://localhost/api/users/${userId}/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          if (!response.ok) throw new Error("User fetch failed");
          const userData = await response.json();
          const username = userData.username;
          setTimeout(() => {
            window.history.replaceState(null, null, `/users/${username}`);
            window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: `/users/${username}` } }));
          }, 100);
          try {
            await import("../pages/profile.js");
            return `<profile-page username="${username}"></profile-page>`;
          } catch (moduleError) {
            console.error("Error loading profile module:", moduleError);
            return "<loading-progress></loading-progress>";
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setTimeout(() => {
            window.history.replaceState(null, null, "/home");
            window.dispatchEvent(new CustomEvent("stateChanged", { detail: { value: "/home" } }));
          }, 100);
          return "<loading-progress></loading-progress>";
        }
      } else {
        try {
          await import("../pages/profile.js");
          return "<profile-page></profile-page>"; // Loads current user profile
        } catch (error) {
          console.error("Error loading profile:", error);
          return "<loading-progress></loading-progress>";
        }
      }
    }
     },
    {
      path: '/selectgamemode',
      view: async () => { await import("../pages/selectgamemode.js"); return "<select-game></select-game>"; }
     },
    {
      path: '/aigame',
      view: async () => {
      await import('../pages/aigame.js');
      return '<aigame-page></aigame-page>';
    }
     },
    {
      path: '/localgame',
      view: async () => {
      await import('../pages/localgame.js');
      return '<localgame-page></localgame-page>';
    }
     },
    {
      path: '/tournament',
      view: async () => {
        await import('../pages/tournament.js');
        return '<tournament-page></tournament-page>';
      }
    },
    {
      path: '/about',
      view: async () => {
      await import('../pages/about.js');
      return '<about-page></about-page>';
    },
     }
  ]
export default routes;
