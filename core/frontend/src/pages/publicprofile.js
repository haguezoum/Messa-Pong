let template = document.createElement("template");

template.innerHTML = `<div id="publicprofile-page" class="publicprofile-page"> Hello from PUBLICPROFILE... ! </div>`;


class PUBLICPROFILE extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/publicprofile-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("PUBLICPROFILE is Connected");
  }
  
  disconnectedCallback() {
    console.log('PUBLICPROFILE is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('publicprofile-page', PUBLICPROFILE);

export default PUBLICPROFILE;
