let template = document.createElement("template");

template.innerHTML = /*html*/
  `<div id="signup-page" class="signup-page">
    <div class="signup-container">
      <div class="signup-header">
        <h1>Sign Up</h1>
      </div>
      <div class="signup-form">
        <form class="signup-form">
          <div class="form-group  form-group-1">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Enter your username" required>
          </div>
        </form>
      </div>
    </div>
  </div>`;


class SIGNUP extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/signup-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("SIGNUP is Connected");
  }
  
  disconnectedCallback() {
    console.log('SIGNUP is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('signup-page', SIGNUP);

export default SIGNUP;
