let template = document.createElement("template");

template.innerHTML = /*html*/
`<div id="game-history-card" class="game-history-card">
  <div id="card-container">
    <div class="match-card">
      <div class="player player-a">
        <img class="avatar" src="" alt="">
        <div class="player-name">Loading ...</div>
      </div>
      <div class="match-result">
        <div class="result-status">Loading ...</div>
        <div class="score">Loading ... - Loading ...</div>
      </div>
      <div class="player player-b">
        <img class="avatar" src="" alt="">
        <div class="player-name">Loading ...</div>
      </div>
    </div>
  </div>
</div>`;


class Gamehistorycard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/game-historycard.css');
    this.shadow.appendChild(linkElem);
  }
  
  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    this.matchcard = this.shadow.querySelector('.match-card');
    this.result = this.getAttribute('result') || 'draw';
    this.playerA = JSON.parse(this.getAttribute('playerA'));
    this.playerB = JSON.parse(this.getAttribute('playerB'));
    this.avatarA = this.shadow.querySelector('.player-a .avatar');
    this.avatarB = this.shadow.querySelector('.player-b .avatar');
    this.playerAName = this.shadow.querySelector('.player-a .player-name');
    this.playerBName = this.shadow.querySelector('.player-b .player-name');
    this.resultStatus = this.shadow.querySelector('div.result-status');
    this.initCard(this.playerA, this.playerB, this.result, "connectedCallback");
  }
  
  disconnectedCallback() {
    console.log('Gamehistorycard is Disonnected');
  }

  static get observedAttributes() {
    return["result"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && oldValue !== null) {
      setTimeout(() => {
        this.initCard(this.playerA, this.playerB, (name == "result" && newValue), "attributeChangedCallback");
      }, 600);
    }
    // called when one of attributes listed above is modified
  }
  
  // <------------------------------ Methods ------------------------------>
  
  initCard(playerA, playerB, result) {
    this.avatarA.src = playerA.avatarUrl;
    this.avatarB.src = playerB.avatarUrl;
    this.playerAName.textContent = playerA.name;
    this.playerBName.textContent = playerB.name;
    this.shadow.querySelector('.score').textContent = `${playerA.score} - ${playerB.score}`;
    Array.from(this.resultStatus?.classList).forEach(className => { this.resultStatus?.classList.remove(className); });
    this.resultStatus?.classList.add(result.toLowerCase());
    this.resultStatus.textContent = result;
    this.matchcard?.classList.add(result.toLowerCase());
  }
  
}
customElements.define('game-history-card', Gamehistorycard);

export default Gamehistorycard;