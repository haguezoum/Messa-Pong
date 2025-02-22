import routes from "./routes.js"; // import the routes object

function navigateTo(url) {
  history.pushState(null, null, url);
  routerCore();
}

const routerCore = async () => {
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      isMatch: location.pathname === route.path,
    };
  });

  let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);

  if (!match) {
    match = {
      route: {
        path: "/404",
        view: async () => {
          // await import("./pages/404.js");
          console.log("404");
          return /*html*/`<router-link to="/" kind="route"> GO HOME </router-link>`;
        },
      },
    };
  }
  const view = await match.route.view();
  document.querySelector("#app").innerHTML = view;
};

const Router = {
  init: () => {
    window.addEventListener("stateChanged", (e) => {
      navigateTo(e.detail.value);
    });
    routerCore();
  },
};

// when the back or forward button is clicked
window.addEventListener("popstate", () => {
  app.state.currentPage = location.pathname;
  routerCore();
});

export default Router;
