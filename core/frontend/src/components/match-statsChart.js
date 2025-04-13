let template = document.createElement("template");

template.innerHTML = /*html*/
`<div id="match-statsChart" class="match-statsChart">
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
    linkElem.setAttribute('href', 'src/assets/style/match-statsChart.css');
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
    // Ensure we have valid data
    if (!data || !data.matchStats) {
      console.warn('Invalid data format for match stats chart, using default values');
      data = { 
        matchStats: { 
          winPercentage: 0, 
          drawPercentage: 0, 
          lossPercentage: 0 
        } 
      };
    }
    
    // Get references to the stat bar fills
    const winBar = this.shadowRoot.querySelector('.win-bar');
    const drawBar = this.shadowRoot.querySelector('.draw-bar');
    const lossBar = this.shadowRoot.querySelector('.loss-bar');
    const doughnutChart = this.shadowRoot.querySelector('#doughnut-chart');
    
    // Ensure the matchStats properties exist, defaulting to 0 if not
    const winPercent = data.matchStats.winPercentage || 0;
    const drawPercent = data.matchStats.drawPercentage || 0;
    const lossPercent = data.matchStats.lossPercentage || 0;
    
    // Animate the bars to their actual percentages
    setTimeout(() => {
      winBar.style.width = `${winPercent}%`;
      drawBar.style.width = `${drawPercent}%`;
      lossBar.style.width = `${lossPercent}%`;
      const ctx = doughnutChart.getContext('2d');
      ctx.clearRect(0, 0, doughnutChart.width, doughnutChart.height);
      const doughnutData = {
        labels: ['Win', 'Draw', 'Loss'],
        datasets: [{
          data: [winPercent, drawPercent, lossPercent],
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
