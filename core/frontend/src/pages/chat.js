let template = document.createElement("template");

template.innerHTML = `<div id="chat-page" class="chat-page"> Hello from CHAT... ! </div>`;


class CHAT extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/chat-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("CHAT is Connected");
  }
  
  disconnectedCallback() {
    console.log('CHAT is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('chat-page', CHAT);

export default CHAT;
