let template = document.createElement("template");

template.innerHTML = '<div id="home-page"> Hello from HOME... </div>';


class HOME extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/home-page.css');
    shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("HOME is Connected");
  }
  
  async disconnectedCallback() {
    console.log('HOME is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('home-page', HOME);

export default HOME;