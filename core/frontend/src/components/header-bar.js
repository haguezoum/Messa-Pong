let template = document.createElement("template");

template.innerHTML = /*html*/ `
  <div id="header-bar" class="header-bar">
      <header class="header">
            <div class="logo" onclick="app.state.currentPage = '/home'" style="cursor: pointer;">
                <ion-icon src="/src/assets/images/42_logo.svg"></ion-icon>
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
                    <img src="/src/assets/images/default.jpg" alt="avatar" class="avatarImage">
                </div>
                <nav class="dropdown">
                    <div class="profile-avatar-container">
                        <div class="profile-avatar">
                            <img onclick="app.state.currentPage = '/users'"  src="/src/assets/images/default.jpg" alt="avatar" class="profileAvatarImage">
                        </div>
                        <span class="profile-name" onclick="app.state.currentPage = '/users'" >Guest</span>
                    </div>
                    <ul class="dropdown-list">
                        <li class="dropdown-item">
                            <router-link to="/users">
                                <span slot="title">Profile</span>
                            </router-link>
                        </li>
                        <li class="dropdown-item">
                          <router-link to="/friendrequest">
                            <span slot="title">Friends Request</span>
                          </router-link>
                        </li>
                        <li class="dropdown-item">
                          <router-link to="/settings">
                            <span slot="title">Settings</span>
                          </router-link>
                        </li>
                        <li class="dropdown-item">
                        <router-link to="/about">
                          <span slot="title">About</span>
                        </router-link>
                      </li>
                        <li class="dropdown-item">
                          <button class="logout-button" id="logout-button">Logout <ion-icon name="log-out"></ion-icon> </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
  </div>
`;

class Headerbar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "/src/assets/style/header-bar.css");
    this.shadow.appendChild(linkElem);
  }

  async connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.searchEngine();
    this.keyBinding();
    await this.loadUserProfile(); // Load authenticated user's profile
    this.shadow.querySelector(".profile-section").addEventListener("click", (e) => {
      e.preventDefault();
      const dropdown = this.shadow.querySelector(".dropdown");
      if(dropdown.classList.contains("showDropdown")) {
        dropdown.classList.remove("showDropdown");
        dropdown.classList.add("hideDropdown");
      } else {
        dropdown.classList.remove("hideDropdown");
        dropdown.classList.add("showDropdown");
      }
    });
    this.shadow.querySelector("#logout-button").addEventListener("click", this.logout.bind(this));
  }

  disconnectedCallback() {}
  // Logout function
  logout(e) {
    e.preventDefault();
    console.log('Logging out...');
    
    // Clear all storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    
    console.log('All tokens cleared');
    
    // Redirect to login page using app state
    app.state.currentPage = '/login';
  }

  // Fetch and display the authenticated user's profile
  async loadUserProfile() {
    const token = localStorage.getItem("access_token"); // Assuming token is stored in localStorage
    if (!token) return;

    try {
      const response = await fetch("https://localhost/api/users/me/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const avatarImg = this.shadow.querySelector(".avatarImage");
        const profileAvatarImg = this.shadow.querySelector(".profileAvatarImage");
        const profileName = this.shadow.querySelector(".profile-name");

        if (userData.profile_picture_url) {
          avatarImg.src = userData.profile_picture_url;
          profileAvatarImg.src = userData.profile_picture_url;
        }
        profileName.textContent = userData.username || "User";
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }

  keyBinding() {
    const searchInput = this.shadow.querySelector(".search");
    const searchResultsList = this.shadow.querySelector(".search-results-list");

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchResultsList.style.display = "none";
      }
      if (e.key === "Enter") {
        const searchResultsListItems = this.shadow.querySelectorAll(".search-result-list-item");
        searchResultsListItems.forEach((item) => {
          if (item.classList.contains("active")) {
            const username = item.getAttribute("data-username");
            window.location.href = `/users/${username}`; 
          }
        });
      }

      if (e.key === "ArrowDown") {
        const searchResultsListItems = this.shadow.querySelectorAll(".search-result-list-item");
        let index = Array.from(searchResultsListItems).findIndex((item) => {
          return item.classList.contains("active");
        });
        if (index === searchResultsListItems.length - 1) index = -1;
        if (searchResultsListItems.length > 0 && searchResultsListItems[index + 1]) {
          searchResultsListItems[index + 1].classList.add("active");
          searchResultsListItems[index + 1].focus();
        }
      }

      if (e.key === "ArrowUp") {
        const searchResultsListItems = this.shadow.querySelectorAll(".search-result-list-item");
        let index = 0;
        searchResultsListItems.forEach((item, i) => {
          if (item.classList.contains("active")) {
            item.classList.remove("active");
            index = i;
          }
        });
        if (index === 0) index = searchResultsListItems.length;
        if (searchResultsListItems.length > 0 && searchResultsListItems[index - 1]) {
          searchResultsListItems[index - 1].classList.add("active");
          searchResultsListItems[index - 1].focus();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        searchInput.focus();
        e.preventDefault();
      }
    });
  }

  searchEngine() {
    const searchInput = this.shadow.querySelector(".search");
    const searchResults = this.shadow.querySelector(".search-results");
    const searchIcon = this.shadow.querySelector(".search-icon");
    const searchResultsList = this.shadow.querySelector(".search-results-list");
    const maxResults = 5;
    const token = localStorage.getItem("access_token"); // JWT token

    if (!searchInput) return;

    searchInput.addEventListener("input", async (e) => {
      searchResultsList.innerHTML = '<li class="searching">Searching...</li>';
      const query = searchInput.value.trim();
      if (query.length < 1 || e.key === "Escape" || e.target.value === "") {
        searchResults.style.display = "none";
        return;
      }

      setTimeout(async () => {
        try {
          // Assuming a search endpoint exists; if not, filter users client-side or add a backend endpoint
          const response = await fetch(`https://localhost/api/users/?search=${query}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }

          const results = await response.json();
          searchResultsList.innerHTML = ""; // Clear previous results

          if (!results || results.length === 0) {
            searchResults.style.display = "block";
            searchResultsList.innerHTML = '<li class="searching">No results found</li>';
            return;
          }

          searchResults.style.display = "block";

          results.slice(0, maxResults).forEach((user) => {
            const li = document.createElement("li");
            const profilePic = document.createElement("div");
            const profileName = document.createElement("span");
            const profileUsername = document.createElement("span");

            li.classList.add("search-result-list-item");
            li.addEventListener("click", () => {
              app.state.currentPage = `/users/${user.username}`; // Redirect to user profile using app state
            });
            profilePic.classList.add("profile-picture");
            profileName.classList.add("profile-name");
            profileUsername.classList.add("profile-username");
            profileUsername.textContent = `@${user.username}`;
            profilePic.style.backgroundImage = `url(${user.profile_picture_url || '/src/assets/images/default.jpg'})`;
            profileName.textContent = user.first_name || user.username;
            li.appendChild(profilePic);
            li.appendChild(profileName);
            li.appendChild(profileUsername);
            li.setAttribute("data-username", user.username);
            searchResultsList.appendChild(li);
          });
        } catch (error) {
          console.error("Search error:", error);
          searchResultsList.innerHTML = '<li class="searching">Error searching users</li>';
          searchResults.style.display = "block";
        }
      }, 700);
    });

    searchResultsList.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        searchInput.value = e.target.getAttribute("data-username");
        searchResults.style.display = "none";
      }
    });

    searchIcon.addEventListener("click", () => {
      searchInput.value = "";
      searchResults.style.display = "none";
    });
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("header-bar", Headerbar);

export default Headerbar;
