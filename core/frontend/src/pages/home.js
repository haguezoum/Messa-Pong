let template = document.createElement("template");
template.innerHTML = /*html*/ `
<div id="home-page" class="home-page">
    <div class="container">
        <header-bar></header-bar>
        <main class="grid-layout">
            <div class="grid-item" id="play-now" data-target="game" onclick='app.state.currentPage="/selectgamemode"'>
                <img class="selectCardImage" src="src/assets/images/pingpongPlayer.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Play now</h3>
                    <span class="play-btn action-btn">
                      <ion-icon name="play-circle-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="my-store" data-target="store">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/store.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">My Store</h3>
                    <span class="store-btn action-btn">
                      <ion-icon name="storefront-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="leaderboard" data-target="leaderboard" onclick='app.state.currentPage="/leaderboard"'>
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/my_dashboard.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Leaderboard</h3>
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
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/home-page.css");
    this.shadow.appendChild(linkElem);
  }

  async connectedCallback() {
    console.log('HOME connectedCallback');
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log('No access token, redirecting to /login');
      window.location.href = '/login';
      return;
    }

    const isAuthenticated = await this.checkAuthentication();
    if (isAuthenticated) {
      console.log('Rendering home page');
      this.shadow.appendChild(template.content.cloneNode(true));
    } else {
      console.log('Not authenticated, redirecting to /login');
      window.location.href = '/login';
    }
  }

  async checkAuthentication() {
    try {
      const accessToken = localStorage.getItem('access_token');
      console.log('Checking auth with token:', accessToken ? `${accessToken.slice(0, 10)}...` : 'None');
      if (!accessToken) {
        console.log('No access token found');
        return false;
      }

      const response = await fetch('https://localhost/api/auth/is_authenticated/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Auth response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token invalid, attempting refresh');
          const newAccessToken = await this.refreshToken();
          if (newAccessToken) {
            return await this.checkAuthentication(); // Retry with new token
          }
        }
        throw new Error(`Authentication failed: ${response.status}`);
      }

      console.log('User is authenticated');
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      const response = await fetch('https://localhost/api/auth/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      console.log('Token refreshed:', data.access.slice(0, 10) + '...');
      return data.access;
    } catch (error) {
      console.error('Refresh token error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  }

  disconnectedCallback() {
    console.log('HOME disconnected');
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define("home-page", HOME);
export default HOME;
