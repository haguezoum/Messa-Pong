let template = document.createElement("template");

template.innerHTML = `<div id="profile-page" class="profile-page"> Hello from PROFILE... ! </div>`;


class PROFILE extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/profile-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("PROFILE is Connected");
  }
  
  disconnectedCallback() {
    console.log('PROFILE is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('profile-page', PROFILE);

export default PROFILE;
