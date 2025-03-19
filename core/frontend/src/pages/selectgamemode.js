let template = document.createElement("template");

template.innerHTML = 
  /*html*/
`<div class="container1">
      <div class="offline-image">
          <img src="images/offline.png">
          <img class="ball" src="images/ball.png">
      </div>
      <div>
          <p class="offline-text">
              Offline
          </p>
      </div>
      <div>
          <p class="MODE-text">
              MODE
          </p>
      </div>
      </div>
      <div class="container2">
      <div class="online-image">
          <img src="images/online.png">
      </div>
      <div class="texts">
          <p class="online-text">
              Online
          </p>
          <p class="MODE-online">
              MODE
          </p>
      </div>
      </div>
      <div class="container3">
      <div class="turnoi-image">
          <img src="images/turnoi.png">
      </div>
      <div class="texts_t">
          <div class="text1_t">
              <p class="turnoi-text">
                  Tournament
              </p>
          </div>
          <div class="text2_t">
              <p class="MODE-textturnoi">
                  MODE
              </p>
          </div>
      </div>
</div>`;


class SELECTGAMEMODE extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/selectgamemode-page.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("SELECTGAMEMODE is Connected");
  }
  
  disconnectedCallback() {
    console.log('SELECTGAMEMODE is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

}
customElements.define('selectgamemode-page', SELECTGAMEMODE);

export default SELECTGAMEMODE;
