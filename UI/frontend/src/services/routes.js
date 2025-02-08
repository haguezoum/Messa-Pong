const routes = [
  {
    path: "/home",
    view: async () => {
      await import("../pages/home.js");
      return "<home-page></home-page>";
    },
  },
  {
    path: "/login",
    view: async () => {
      await import("../pages/login.js");
      return "<login-page></login-page>";
    },
  },
  {
    path: "/signup",
    view: async () => {
      await import("../pages/signup.js");
      return "<signup-page></signup-page>";
    },
  },
  {
    path: "/tfa",
    view: async () => {
      await import("../pages/towfa.js");
      return "<towfa-page></towfa-page>";
    },
  },
];
export default routes;
