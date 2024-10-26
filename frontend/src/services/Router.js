import routes from "./routes.js" // import the routes object

function navigateTo(url) {
    history.pushState(null, null, url);
    routerCore();
}

const routerCore = async () => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = { route: { path: "/404",
        view: async()=>{
            await import("./pages/404.js");
            return ('<notfound-page></notfound-page>')
        } 
        }};
    }
    const view = await match.route.view();
    document.querySelector("#app").childNodes.forEach(e => e.remove());
    document.querySelector("#app").innerHTML = view;
};

const Router = {
    init: () => { 
        console.log('Router is here');
        document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-route]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
        });
        routerCore();
    }
};

window.addEventListener("popstate", ()=>{
    // when the back or forward button is clicked
    routerCore();
});

export default Router

// document.addEventListener("DOMContentLoaded", () => {
//     document.body.addEventListener("click", (e) => {
//         if (e.target.matches("[data-route]")) {
//             e.preventDefault();
//             navigateTo(e.target.href);
//         }
//     });
//     router();
// });