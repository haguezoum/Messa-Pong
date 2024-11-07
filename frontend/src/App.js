/*
 * This is the main file of the application
 * This file will contain the Router of the application
 * This file will contain the Store of the application
 * You can use import to import the components and use them in the Router
 * You can use import to import the store and use it in the application
 * You can use import to import the API and use it in the application
 * for example : import API from './services/API';
 * for the staet managment (State.js) you can build your own observer useing Proxy in js
 */

import API from "./services/API.js";
import Router from "./services/Router.js";
import State from "./services/State.js";

// Custom global object
window.app = {};

// Store, Global object ----
app.state = State;

// Router, Global object ---
app.Router = Router;

// API, Global object ------
app.API = API;

// sleep function

app.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

window.addEventListener("DOMContentLoaded", () => {
  // Start the application
  app.Router.init();
  // start the store
});

// Dark mode
window.addEventListener("stateChanged", (event) => {
  console.log("dark mode changed");
  // console.log(event)
  // console.log(event.detail)
  if (event.detail.key === "darkMode") {
    document.querySelectorAll(".master-container .card").forEach((card) => {
      card.classList.toggle("dark", event.detail.value);
    });
  }
});
