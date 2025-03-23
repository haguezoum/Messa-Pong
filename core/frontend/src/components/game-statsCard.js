let template = document.createElement("template");

template.innerHTML = /*html*/`
<div id="game-statscard" class="game-statscard">
  <div class="stats-container">
    <div class="stat-card">
      <div class="stat-icon">🎯</div>
      <div class="stat-value">-</div>
      <div class="stat-label">Total games</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-value">-</div>
      <div class="stat-label">Win</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🤝</div>
      <div class="stat-value">-</div>
      <div class="stat-label">Draw</div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">😔</div>
      <div class="stat-value">-</div>
      <div class="stat-label">Loss</div>
    </div>
  </div>
</div>`;


class GamestatsCard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/game-statsCard.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("GamestatsCard is Connected");
    window.addEventListener('gameStatsLoaded', (event) => {
      this.updateStats(event.detail);
    });
  }
  
  disconnectedCallback() {
    console.log('GamestatsCard is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }
  // <------------------------------ Methods ------------------------------>

  updateStats(data) {
    const statValues = this.shadowRoot.querySelectorAll('.stat-value');
    
    // Update the stats with actual data
    statValues[0].textContent = data.totalGames;
    statValues[1].textContent = data.wins;
    statValues[2].textContent = data.draws;
    statValues[3].textContent = data.losses;
  }
}
customElements.define('game-statscard', GamestatsCard);

export default GamestatsCard;