class Routerlink extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.innerHTML = `<slot name="title"></slot>`;
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/router-link.css");
    this.shadow.appendChild(linkElem);
    this.addEventListener("keydown", this.handelkeydown.bind(this));
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      e.preventDefault();
      const link = this.getAttribute("to");
      const kind = this.getAttribute("kind");
      e.preventDefault();
      if (kind === "ext") {
        if (link.startsWith("http://") || link.startsWith("https://")) {
          window.open(link, "_blank");
        } else {
          console.log("Invalid URL");
        }
        return;
      } else {
        app.state.currentPage = link;
        app.state.pageHistory.push(link);
      }
      console.log("Routerlink clicked");
    });
  }
  handelkeydown(e) { // handle enter key press
    if (e.key === "Enter") {
      this.click();
    }
  }
  disconnectedCallback() {
    console.log("Routerlink is Disonnected");
  }

  static get observedAttributes() {
    return ["to", "kind"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      "Routerlink: " + name + " changed to " + newValue + " from " + oldValue
    );
  }
}
customElements.define("router-link", Routerlink);

export default Routerlink;
