# ft_transcendence
ping pong online game with realtime chat ...


## Usage

### since JavaScript has no built-in sleep function to pause execution, you can use a global object called `sleep(<duration>)`

```javascript
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage example
async function example() {
    console.log('Start');
    await sleep(2000); // Sleep for 2000 milliseconds (2 seconds)
    console.log('End');
}

example();
```

### Folder structer
<!-- 
├──
│
└──
  -->
```
├── Public/
│     │ 
│     └──index.html [contain the container that we put on it the 'pages' with id = app and any other static component]  
│
└── src/ (containe a bunch of folder and files this is the source of projects)
     │ 
     ├── assets/
     │       │ 
     │       ├── icons/ (contain a SVG icons you can use it derictly or thgrout img tag <img src="src/assest/feather/face.svg">)
     │       │ 
     │       ├── images/ (contain a image JPG & PNG )
     │       │       │ 
     │       │       └── charachters/ (containe the image of default user avatr or charachter to use in the app SVG)
     │       │                 │ 
     │       │                 ├── back-white/ (same charachters in black white)
     │       │                 │ 
     │       │                 └── home_main/
     │       │                           ├── home_charachters/ (contain the image of home page)
     │       │                           │ 
     │       │                           └── store_charachters/ (contain the image of store page)
     │       │ 
     │       └── style/ (contain all the style of app component (components/ & pages/))
     │              │ 
     │              ├── variables.css (conatin all the variables thet can use in the app called in App.css)
     │              │ 
     │              └── normalize.css (reset the default style of the browsers)
     │    
     ├── components/ (contain the components of the app {generated using command <component component-name> })
     │           │ 
     │           ├── router-link.js (built-in component used for routing between app pages : <router-link to="/pageName" kind="route">)
     │           │ 
     │           └── ...
     │ 
     ├── pages/ (contain pages of the app ) (AMADIL creates a route for every file in the pages/ directory after generate it using command <page pageName> )
     │ 
     ├── services/
     │      │ 
     │      ├── API.js (a file contain a global method that need to call an http request [app.API])
     │      │ 
     │      ├── Router.js (a file that manage the routing of the app use the routes.js array to know the page of the app if dosnt exist it returen a 404 page otherways its inject the tage
     │      │              that come froum routes.js into a div with id=app into index.html)
     │      │ 
     │      ├── routes.js (a file contain an array of all pages of the app , auto generated and use  a lazu loading thats means he only import the page that called by the browser)
     │      │ 
     │      └── State.js (a pale the role of state managment , add the proprty that you need to watch to state object then lisnet to the chnage anywhere in the app , you can chane the 
     │                      proprty anywher in the app using app.state.[proprty] = newValue)
     │ 
     ├──App.css (conatin the global style of the app the last changes happend here)
     │ 
     ├──App.js (init the Router and inject some methond to the global object to easy access)
     │ 
     └──index.js (import the app components in here <import "./components/router-link.js";>)
  
```