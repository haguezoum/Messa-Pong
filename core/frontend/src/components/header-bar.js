let template = document.createElement("template");

template.innerHTML =
  /*html*/
  ` <div id="header-bar" class="header-bar">
      <header class="header">
            <div class="logo" onclick="app.state.currentPage = '/home'" style="cursor: pointer;">
                <ion-icon src="src/assets/images/42_logo.svg"></ion-icon>
            </div>
            <div class="search_wraper" style="--showResult:true">
                <input type="text" id="search" class="search" placeholder="Quick search..." maxlength="30" tabindex="1">
                <div class="search-results">
                    <ul class="search-results-list"></ul>
                </div>
                <span class="search-icon" tabindex="2">
                    <ion-icon name="search-outline"></ion-icon>
                </span>
                <span class="shortcut targert"><kbd>⌘</kbd><kbd>K</kbd></span>
                <span class="shortcut clear"><kbd>Esc</kbd></span>
            </div>
            <div class="profile-section" tabindex="3">
                <div class="avatar">
                    <img src="src/assets/images/charachters/bust-mask-13.svg" alt="avatar" class="avatarImage">
                </div>
                <nav class="dropdown">
                    <div class="profile-avatar-container">
                        <div class="profile-avatar">
                            <img src="src/assets/images/charachters/bust-mask-13.svg" alt="avatar" class="profileAvatarImage">
                        </div>
                        <span class="profile-name">Hassan Aguezoum</span>

                    </div>
                    <ul class="dropdown-list">
                        <li class="dropdown-item">
                            <router-link to="/profile">
                                <span slot="title">Profile</span>
                            </router-link>
                        </li>
                        <li class="dropdown-item">
                          <router-link to="/leaderboard">
                            <span slot="title">Leaderboard</span>
                          </router-link>
                        </li>
                        <li class="dropdown-item">
                          <router-link to="/settings">
                            <span slot="title">Settings</span>
                          </router-link>
                        </li>
                        <li class="dropdown-item">
                          <logout-button></logout-button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
  </div>`;

class Headerbar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/header-bar.css");
    this.shadow.appendChild(linkElem);
  }
  
  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.searchEngine();
    this.keyBinding();
    // ----------------- Fetching -----------------
    window.addEventListener("fetch", (e) => {
      // not working ...
      console.log("fetching...");
      e.preventDefault();
      const searchResultsList = this.shadow.querySelector(
        ".search-results-list"
      );
      const searchResults = this.shadow.querySelector(".search-results");
      const listItem = document.createElement("li");
      listItem.classList.add("loading");
      searchResultsList.appendChild(listItem);
      searchResults.style.display = "block";
    });
  }

  disconnectedCallback() {
    // window.removeEventListener("keydown");
  }

  keyBinding() { // Keybinding for the search input

    const searchInput = this.shadow.querySelector(".search");
    const searchResultsList = this.shadow.querySelector(".search-results-list");

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        //clear search input
        searchInput.value = ""; // check is the input exist
        searchResultsList.style.display = "none";
      }
      if (e.key === "Enter") {
        const searchResultsListItems = this.shadow.querySelectorAll(
          ".search-result-list-item"
        );
        searchResultsListItems.forEach((item) => {
          if (item.classList.contains("active")) {
            // this is just a test , it should be replaced by the link of the user 
            // redirect the user using (app.state.currentLink = item.getAttribute("data-username"))
            window.open(`https://github.com/${item.getAttribute("data-username")}`);
          }
        });
      }

      if (e.key === "ArrowDown") {
        const searchResultsListItems = this.shadow.querySelectorAll(
          ".search-result-list-item"
        );
        let index = -1  ;
        searchResultsListItems.forEach((item, i) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
            index = i;
          }
        });
        if (index === searchResultsListItems.length - 1) {
          index = -1;
        }
        searchResultsListItems[index + 1].classList.add("active");
        searchResultsListItems[index + 1].focus();
      }

      if (e.key === "ArrowUp") {
        const searchResultsListItems = this.shadow.querySelectorAll(
          ".search-result-list-item"
        );
        let index = 0;
        searchResultsListItems.forEach((item, i) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
            index = i;
          }
        });
        if (index === 0) {
          index = searchResultsListItems.length;
        }
        searchResultsListItems[index - 1].classList.add("active");
        searchResultsListItems[index - 1].focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        searchInput.focus();
        e.preventDefault();
      }
    });
  } // End of keyBinding

  searchEngine() { // Search engine for the search input
    const searchInput = this.shadow.querySelector(".search");
    const searchResults = this.shadow.querySelector(".search-results");
    const searchIcon = this.shadow.querySelector(".search-icon");
    const searchResultsList = this.shadow.querySelector(".search-results-list");
    const maxResults = 5;
    let results = [];

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      searchResultsList.innerHTML = '<li class="searching">Searching...</li>';
      const query = searchInput.value.trim();
      if (query.length < 1 || e.key === "Escape" || e.target.value === "") {
        searchResults.style.display = "none";
        return;
      }

      setTimeout(async() => {
        const data =  await fetch(`https://api.github.com/search/users?q=${query}`)
        results = await data.json();
        searchResultsList.innerHTML = ""; // Clear previous results

        if (!results.items || results.items.length === 0) {
          searchResults.style.display = "block";
          searchResultsList.innerHTML =
            '<li class="searching" >No results found</li>';
        }

        searchResults.style.display = "block";

        if (results.items) {
          results.items.forEach((user) => {
            if (searchResultsList.children.length >= maxResults) return;
            const li = document.createElement("li");
            const profilePic = document.createElement("div");
            const profileName = document.createElement("span");
            const profileUsername = document.createElement("span");
            li.classList.add("search-result-list-item");
            li.addEventListener("click", () => {
              window.open(user.html_url);
            });
            profilePic.classList.add("profile-picture");
            profileName.classList.add("profile-name");
            profileUsername.classList.add("profile-username");
            profileUsername.textContent = "@" + user.login;
            profilePic.style.backgroundImage = `url(${user.avatar_url})`;
            li.appendChild(profilePic);
            li.appendChild(profileName);
            li.appendChild(profileUsername);
            li.setAttribute("data-username", user.login);
            searchResultsList.appendChild(li);
          });
        } else {
          console.info("You reach the API limit! 🤓");
        }
      }, 700);      
    }); // End of input event listener

    // Event listener to set input when a result is clicked
    searchResultsList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        searchInput.value = e.target.getAttribute("data-username");
        searchResults.style.display = "none";
      }
    });

    // Clear search input when clicking the search icon
    searchIcon.addEventListener("click", () => {
      searchInput.value = "";
      searchResults.style.display = "none";
    });
  } // End of searchEngine

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}
customElements.define("header-bar", Headerbar);

export default Headerbar;