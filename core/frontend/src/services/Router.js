import routes from "./routes.js"; // import the routes object

function navigateTo(url, data = null) {
  if(data){
    history.replaceState(data, null, url);
    import('../pages/publicprofile.js');
    document.querySelector("#app").innerHTML = `<user-profile-page user-id="${data}"></user-profile-page>`;
    return;
  }
  else if(data === null){
    history.pushState(null, null, url);
  }
  document.title = url.substring(1).toUpperCase().concat(" 🏓");
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
    if(location.pathname.includes("user/")) {
      if(location.pathname.includes("undefined")){
        history.pushState(null, null, "/dashboard");
        return;  
      }
      import('../pages/publicprofile.js');
      history.pushState(null, null, "/user");
      const userId = history.state? history.state.user.id : 1;
      document.querySelector("#app").innerHTML = `<user-profile-page user-id="${userId}"></user-profile-page>`;
      return;
    }
    match = {
      route: {
        path: "/404",
        view: async () => {
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
      const miniPath = e.detail.value.includes("user");
      const data = miniPath ? e.detail.value.substring(5) : null;
      const url = data ? "/user" : e.detail.value;
      navigateTo(url, data);
    });
    routerCore();
  },
};

// when the back or forward button is clicked
window.addEventListener("popstate", () => {
  if(location.pathname.includes("user/")){
    const userId = history.state? history.state : history.state.user.id;
    // app.state.currentPage = "/dashboard";
    return;
  }
  app.state.currentPage = location.pathname;
  routerCore();
});

export default Router;