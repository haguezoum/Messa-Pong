let template = document.createElement("template");

template.innerHTML = /*html*/`
<button class="logout-button">Logout</button>
`;

class LogoutButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = template.innerHTML;
    // Use arrow function to preserve 'this' context correctly
    const logoutButton = this.querySelector('.logout-button');
    if (logoutButton) {
      logoutButton.addEventListener("click", (e) => this.logout(e));
    }
  }

  disconnectedCallback() {
    this.innerHTML = "";
    const logoutButton = this.querySelector('.logout-button');
    if (logoutButton) {
      logoutButton.removeEventListener("click", (e) => this.logout(e));
    }
  }

  static get observedAttributes() {
    return ["text"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.innerHTML = newValue;
  }

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
}

customElements.define("logout-button", LogoutButton);

export default LogoutButton;