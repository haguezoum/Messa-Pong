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
    if (location.pathname === "/") {
      location.pathname = "/home";
      return;
    }
    match = {
      route: {
        path: "/404",
        view: async () => {
          // await import("./pages/404.js");
          console.log("404");
          return "lol";
        },
      },
    };
  }
  const view = await match.route.view();
  document.querySelector("#app").childNodes.forEach((e) => e.remove());
  document.querySelector("#app").innerHTML = view;
};

const Router = {
  init: () => {
    window.addEventListener("stateChanged", (e) => {
      navigateTo(e.detail.value);
    });
    }

    function traverseShadowRoots(node) {
      if (node.shadowRoot) {
        addClickListener(node.shadowRoot);
        node.shadowRoot.querySelectorAll("*").forEach(traverseShadowRoots);
      }
      node.querySelectorAll("*").forEach(traverseShadowRoots);
    }

    // Add click listener to the document body
    addClickListener(document.body);

    // Traverse and add click listeners to all shadow roots
    traverseShadowRoots(document);

    routerCore();
  },
};

// when the back or forward button is clicked
window.addEventListener("popstate", () => {
  routerCore();
});

export default Router;
