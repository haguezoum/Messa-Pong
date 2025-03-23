import api from '../services/API.js';

let template = document.createElement("template");
template.innerHTML =
  /*html*/
  `<div id="home-page" class="home-page">
    <div class="container">
        <header-bar></header-bar>
        <main class="grid-layout">
            <div class="grid-item" id="play-now" data-target="game" onclick='app.state.currentPage="/selectgamemode"'>
               <!-- <img class="selectCardImage"  src="src/assets/images/charachters/home_main/home_characters/l9erd.png" alt="" srcset="" loading="lazy"> -->
                <img class="selectCardImage"  src="src/assets/images/pingpongPlayer.png" alt="" srcset="" loading="lazy">
               <div class="selectCardControles">
                    <h3 class="left">Play now</h3>
                    <span class="play-btn action-btn">
                      <ion-icon name="play-circle-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="my-store" data-target="store">
                <img class="selectCardImage"  src="src/assets/images/charachters/home_main/home_characters/store.png" alt="" srcset="" loading="lazy">
               <div class="selectCardControles">
                   <h3 class="left">My Store</h3>
                   <span class="store-btn action-btn">
                    <ion-icon name="storefront-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="dashboard" data-target="dashboard" onclick='app.state.currentPage="/dashboard"'>
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/my_dashboard.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Dashboard</h3>
                    <span class="dashboard-btn action-btn">
                      <ion-icon name="apps-outline"></ion-icon>
                      </span>
                </div>
            </div>
            <div class="grid-item" id="chat-space" data-target="chat" onclick='app.state.currentPage="/chat"'>
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/chat.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Chat space</h3>
                    <span class="dashboard-btn action-btn">
                      <ion-icon name="chatbubbles-outline"></ion-icon>
                    </span>
                </div>
            </div>
        </main>
    </div>
    <cloud-moving cloudCount="10"></cloud-moving> 
</div>`;

class HOME extends HTMLElement {

  //should check if user is authenticated if not redirect to login page 
  //if user is authenticated then show the home page
  constructor() {
    super();
     this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/home-page.css");
    this.shadow.appendChild(linkElem);
  }
  
  async connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    try {
      await this.checkAuthentication();
      // If authentication successful, fetch user profile
      await this.fetchUserProfile();
    } catch (error) {
      console.error('Error during authentication check:', error);
      app.state.currentPage = '/login';
    }
  }

  async checkAuthentication() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No token found');
      }

      // Try to get user profile to verify token
      try {
        await this.fetchUserProfile();
        return true;
      } catch (error) {
        console.log('Token validation error:', error);
        
        // If token validation fails, try to refresh
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        try {
          const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
          if (response && response.access) {
            // Update the access token
            localStorage.setItem('access_token', response.access);
            return true;
          }
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError);
          // Clear tokens on refresh failure
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          throw new Error('Authentication failed');
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      throw error;
    }
  }

  async fetchUserProfile() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token');
      }

      // Add authorization header to API service for this request
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const profile = await api.get('/api/profile/', { headers });
      if (profile) {
        localStorage.setItem('user_data', JSON.stringify(profile));
        return profile;
      }
      throw new Error('Failed to fetch user profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async disconnectedCallback() {
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}
customElements.define("home-page", HOME);

export default HOME;