import routes from "./routes.js";

const loadingOverlay = document.createElement("div");
loadingOverlay.className = "global-loading-overlay";
loadingOverlay.innerHTML = `<div class="spinner"></div>`;
document.body.appendChild(loadingOverlay);

function showLoading(show) {
  loadingOverlay.classList.toggle("active", show);
}

function navigateTo(url) {
  console.log("Navigating to:", url);
  showLoading(true);
  history.pushState(null, null, url);
  document.body.setAttribute("data-route", url);
  setTimeout(() => routerCore(), 300); // Delay to allow UI feedback
}

const routerCore = async () => {
  try {
    const pathname = location.pathname;
    console.log("Routing for pathname:", pathname);

    const potentialMatches = routes.map(route => {
      const routeParts = route.path.split("/").filter(Boolean);
      const pathParts = pathname.split("/").filter(Boolean);
      const params = {};

      // If exact match
      if (route.path === pathname) return { route, isMatch: true, params, matchScore: 100 };

      // Check for dynamic route match
      if (routeParts.length === pathParts.length) {
        const isMatch = routeParts.every((part, i) => {
          if (part.startsWith(":")) {
            params[part.slice(1)] = pathParts[i];
            return true;
          }
          return part === pathParts[i];
        });
        if (isMatch) {
          // Calculate how many static parts match (higher score for more static matches)
          const staticMatchCount = routeParts.filter((part, i) => !part.startsWith(":") && part === pathParts[i]).length;
          return { route, isMatch: true, params, matchScore: 50 + staticMatchCount * 10 };
        }
      }
      return { route, isMatch: false, params: {}, matchScore: 0 };
    });

    // Sort matches by score (highest first) and take the best match
    const matches = potentialMatches.filter(m => m.isMatch).sort((a, b) => b.matchScore - a.matchScore);
    
    let match = matches[0];
    if (!match) {
      console.log("No route match found, showing 404");
      match = {
        route: { path: "/404", view: async () => `<router-link to="/">GO HOME</router-link>` },
        params: {},
      };
    }

    console.log("Matched route:", match.route.path, "with params:", match.params);
    document.body.setAttribute("data-route", pathname);

    let app = document.querySelector("#app");
    if (!app) {
      app = document.createElement("div");
      app.id = "app";
      document.body.appendChild(app);
    }

    const view = await match.route.view(match.params);
    app.innerHTML = view;
  } catch (error) {
    console.error("Routing error:", error);
    const app = document.querySelector("#app") || document.createElement("div");
    app.id = "app";
    app.innerHTML = "<h1>Error Loading Page</h1>";
    if (!document.querySelector("#app")) document.body.appendChild(app);
  } finally {
    setTimeout(() => showLoading(false), 300);
  }
};

const Router = {
  init: () => {
    window.addEventListener("stateChanged", (e) => {
      console.log("State changed event:", e.detail.value);
      navigateTo(e.detail.value);
    });

    window.addEventListener("popstate", () => {
      console.log("Popstate event, new path:", location.pathname);
      document.body.setAttribute("data-route", location.pathname);
      routerCore();
    });

    document.body.setAttribute("data-route", location.pathname);
    routerCore();
  },
};

export default Router;
