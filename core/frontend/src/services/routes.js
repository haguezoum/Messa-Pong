
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
      path: '/',
      view: async () => {
    await import('../pages/entrypoint.js');
    return '<entrypoint-page></entrypoint-page>';
  }
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
      path: '/user',
      view: async () => {
      const userId = history.state? history.state : window.location.pathname.split('/')[2];
      await import('../pages/publicprofile.js');
      return `<user-profile-page user-id="${userId}"></user-profile-page>`;
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
      path: '/publicprofile',
      view: async () => {
      await import('../pages/publicprofile.js');
      return '<publicprofile-page></publicprofile-page>';
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
      path: '/selectgamemode',
      view: async () => {
      await import('../pages/selectgamemode.js');
      return '<selectgamemode-page></selectgamemode-page>';
    },
     }
  ]
export default routes;
