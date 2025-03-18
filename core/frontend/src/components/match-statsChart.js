let template = document.createElement("template");

template.innerHTML = /*html*/
`<div id="match-statschart" class="match-statschart">
  <h2>Match Stats</h2>    
  <div class="stats-container">
    <div class="stat-row">
      <div class="stat-label">Win</div>
      <div class="stat-bar">
        <div class="stat-bar-fill win-bar" style="width: 0%"></div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-label">Draw</div>
      <div class="stat-bar">
        <div class="stat-bar-fill draw-bar" style="width: 0%"></div>
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-label">Loss</div>
      <div class="stat-bar">
        <div class="stat-bar-fill loss-bar" style="width: 0%"></div>
      </div>
    </div>
  </div>
</div>`;


class MatchstatsChart extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/match-statschart.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("MatchstatsChart is Connected");
    window.addEventListener('matchStatsLoaded', (event) => {
      this.updateStats(event.detail);
    });
  }
  
  disconnectedCallback() {
    console.log('MatchstatsChart is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

  // ------------------------------ Custom Methods ------------------------------

  updateStats(data) {
    // Get references to the stat bar fills
    const winBar = this.shadowRoot.querySelector('.win-bar');
    const drawBar = this.shadowRoot.querySelector('.draw-bar');
    const lossBar = this.shadowRoot.querySelector('.loss-bar');
    
    // Animate the bars to their actual percentages
    setTimeout(() => {
      winBar.style.width = `${data.matchStats.winPercentage}%`;
      drawBar.style.width = `${data.matchStats.drawPercentage}%`;
      lossBar.style.width = `${data.matchStats.lossPercentage}%`;
    }, 300);
  }
}
customElements.define('match-statschart', MatchstatsChart);

export default MatchstatsChart;
