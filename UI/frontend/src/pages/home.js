let template = document.createElement("template");

template.innerHTML =
  /*html*/
  `<div id="home-page">
       <router-link to="/login">
          <span slot="title">go to log in</span>
       </router-link>
       <br>
       <br>
       <br>
      <router-link to="https://leytonmaroc.teamtailor.com/" kind="ext">
        <span slot="title">External page</span>
      </router-link>
  </div >`;

class HOME extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/home-page.css");
    shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("HOME is Connected");
  }

  async disconnectedCallback() {
    console.log("HOME is Disonnected");
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }
}
customElements.define("home-page", HOME);

export default HOME;
