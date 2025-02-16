let template = document.createElement("template");

template.innerHTML =
  /*html*/
  `<div id="home-page" class="home-page">
    <div class="container">
        <header-bar></header-bar>
        <main class="grid-layout">
            <div class="grid-item" id="play-now" data-target="game">
               <img class="selectCardImage"  src="src/assets/images/charachters/home_main/home_characters/l9erd.png" alt="" srcset="" loading="lazy">
               <div class="selectCardControles">
                    <h3 class="left">Play now</h3>
                    <span class="play-btn action-btn">
                      <ion-icon name="play-circle-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="my-store" data-target="store">
                <img class="selectCardImage"  src="src/assets/images/charachters/home_main/home_characters/store.png" alt="" srcset="" loading="lazy">
               <div class="selectCardControles">
                   <h3 class="left">My Store</h3>
                   <span class="store-btn action-btn">
                    <ion-icon name="storefront-outline"></ion-icon>
                    </span>
                </div>
            </div>
            <div class="grid-item" id="dashboard" data-target="dashboard">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/my_dashboard.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Dashboard</h3>
                    <span class="dashboard-btn action-btn">
                      <ion-icon name="apps-outline"></ion-icon>
                      </span>
                </div>
            </div>
            <div class="grid-item" id="chat-space" data-target="chat">
                <img class="selectCardImage" src="src/assets/images/charachters/home_main/home_characters/chat.png" alt="" srcset="" loading="lazy">
                <div class="selectCardControles">
                    <h3 class="left">Chat space</h3>
                    <span class="dashboard-btn action-btn">
                      <ion-icon name="chatbubbles-outline"></ion-icon>
                    </span>
                </div>
            </div>
        </main>
        </div>
        <cloud-moving cloudCount="10"></cloud-moving> 
  </div>`;

class HOME extends HTMLElement {
  constructor() {
    super();
     this.shadow = this.attachShadow({ mode: "open" });
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "src/assets/style/home-page.css");
    this.shadow.appendChild(linkElem);
  }
  
  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  async disconnectedCallback() {
  }

  static get observedAttributes() {
    return [];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
}
customElements.define("home-page", HOME);

export default HOME;