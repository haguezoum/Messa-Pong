const routes = [
    { 
        path: "/",
        view: async()=>{
            // await import("./pages/home.js");
            // return ('<home-page></home-page>')
        }
    },
    { 
        path: "/about",
        view: async()=>{
            // await import("./pages/about.js");
            // return ('<about-page></about-page>')
        }
    },
    { 
        path: "/contact",
        view: async()=>{
            // await import("./pages/contact.js");
            // return ('<contact-page></contact-page>')
        }
    },
    { 
        path: "/waiting-list",
        view: async()=>{
            // await import("./pages/waitinglist.js");
            // return ('<waitinglist-page></waitinglist-page>')
        }
    },
    // {
    //     path: "/404",
    //     view: async()=>{
    //         await import("./pages/404.js");
    //         return ('<404-page></404-page>')
    //     }
    // }
];


export default routes;