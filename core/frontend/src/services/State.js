const state = {
    darkMode: false,
    currentPage: "/",
    pageHistory: new Array(),
  // You can add other state properties here to watch for changes
};
const appState = new Proxy(state, {
  set: (target, key, value) => {
    if (target[key] !== value) {// Only trigger if value changes
      target[key] = value;
      window.dispatchEvent(
        new CustomEvent("stateChanged", {
          detail: { key, value },
        })
      );
    }
    return true;
  },
});

export default appState;

// this is an example of how to use the state in the application
// add the property to the state object
// create a proxy object to listen to the changes
// and dispatch an event to the application to notify the changes in the state
