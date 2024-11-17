class Routerlink extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
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
