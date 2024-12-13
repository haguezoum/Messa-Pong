
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
      await import('../pages/signup.js');
      return '<signup-page></signup-page>';
    }
     },
    {
      path: '/hassan',
      view: async () => {
      await import('../pages/hassan.js');
      return '<hassan-page></hassan-page>';
    },
     }
  ]
export default routes;
