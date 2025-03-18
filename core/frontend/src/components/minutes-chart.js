let template = document.createElement("template");

template.innerHTML = /*html*/
`<div id="minutes-chart" class="minutes-chart">
<div class="frame-indicator">◻ Frame 12175</div>
<h2>Minutes Played</h2>
<div class="chart-wrapper">
  <canvas id="minutesChart"></canvas>
</div>
</div>`;


class Minuteschart extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/minutes-chart.css');
    this.shadow.appendChild(linkElem);
  }

  connectedCallback() {
    console.log("Minuteschart is Connected");
    window.addEventListener('minutesChartLoaded', (event) => {
      this.updateChart(event.detail);
    });
  }
  
  disconnectedCallback() {
    console.log('Minuteschart is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }
  // <------------------------------ Methods ------------------------------>

  updateChart(data) {
    let ctx = this.shadow.getElementById('minutesChart').getContext('2d');
    let minutesPlayed = data.minutesPlayed;
    let labels = minutesPlayed.map(item => item.day);
    let minutes = minutesPlayed.map(item => item.minutes);
    let minutesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Minutes Played',
          data: minutes,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    minutesChart.update();
  }
}
customElements.define('minutes-chart', Minuteschart);

export default Minuteschart;
