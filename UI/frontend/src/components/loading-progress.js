let template = document.createElement("template");

template.innerHTML =
  /*html*/
 `<div id="loading-progress" class="loading-progress">
    <div class="line-wobble"></div>
  </div>`;


class Loadingprogress extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/loading-progress.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    // console.log("Loadingprogress is Connected");
  }
  
  disconnectedCallback() {
    // console.log('Loadingprogress is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('loading-progress', Loadingprogress);

export default Loadingprogress;
