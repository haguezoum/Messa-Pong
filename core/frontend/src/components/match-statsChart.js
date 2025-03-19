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
    <div class="doughnut-chart">
      <canvas id="doughnut-chart"></canvas>
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
    const doughnutChart = this.shadowRoot.querySelector('#doughnut-chart');
    
    // Animate the bars to their actual percentages
    setTimeout(() => {
      winBar.style.width = `${data.matchStats.winPercentage}%`;
      drawBar.style.width = `${data.matchStats.drawPercentage}%`;
      lossBar.style.width = `${data.matchStats.lossPercentage}%`;
      const ctx = doughnutChart.getContext('2d');
      ctx.clearRect(0, 0, doughnutChart.width, doughnutChart.height);
      const doughnutData = {
        labels: ['Win', 'Draw', 'Loss'],
        datasets: [{
          data: [data.matchStats.winPercentage, data.matchStats.drawPercentage, data.matchStats.lossPercentage],
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
          hoverBackgroundColor: ['#4CAF50', '#FFC107', '#F44336']
        }]
      };
      const doughnutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: doughnutData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          }
        }
      });
      doughnutChartInstance.update();
    }, 300);
  }
}
customElements.define('match-statschart', MatchstatsChart);

export default MatchstatsChart;
