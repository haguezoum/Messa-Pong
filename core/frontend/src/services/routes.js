
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
    },
     }
  ]
export default routes;
