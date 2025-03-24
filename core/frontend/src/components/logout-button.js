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
    this.addEventListener("click", this.logout);
  }

  disconnectedCallback() {
    this.innerHTML = "";
    this.removeEventListener("click", this.logout);
  }

  static get observedAttributes() {
    return ["text"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.innerHTML = newValue;
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    app.state.currentPage = "/login";
  }
}

customElements.define("logout-button", LogoutButton);

export default LogoutButton;