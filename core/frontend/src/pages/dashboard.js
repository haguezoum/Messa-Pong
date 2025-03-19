let template = document.createElement("template");

template.innerHTML = /*html*/
`
<div id="dashboard-page" class="dashboard-page">
  <div class="dashboard-container">
    <header-bar></header-bar>
      <div class="select-statistics">
        <h2>Statistics Dashboard</h2>
        <div class="stats-body-container">
          <div class="game-container"><!---------------------------------------------->
            <div class="tabs">
              <button class="tab-button active" data-tab="stats">Game Stats</button>
              <button class="tab-button" data-tab="history">Game History</button>
              <button class="tab-button" data-tab="all">All</button>
            </div>
      
            <div class="content-container">
              <div id="stats-content" class="stats-contentTab tab-content active"> <!-- start first tab -->
                <div class="stats-container">
                  <game-statscard></game-statscard>
                </div>
                <div class="dashboard-charts">
                  <match-statschart></match-statschart>
                </div> 
                <div class="match-stats-container">
                  <h2 class="match-stats-title">Match Stats</h2>
                  <minutes-chart></minutes-chart>
                </div>
              </div><!-- End first tab -->

              <div id="history-content" class="tab-content history-contentTab">
                <h2>Game History</h2>
              </div>
            </div>
          </div><!---------------------------------------------->
          



        </div>
      </div>
      </div>
      <cloud-moving></cloud-moving>
</div>`;


class DASHBOARD extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/dashboard-page.css');
    this.shadow.appendChild(linkElem);
  }
  
  connectedCallback() {
    this.shadow.appendChild(template.content.cloneNode(true));
    console.log("DASHBOARD is Connected");
    this.animateTabs();
    this.fetchDashboardData()
    .then(data => {
      // Dispatch custom events with the data for each component
      window.dispatchEvent(new CustomEvent('gameStatsLoaded', { detail: data }));
      window.dispatchEvent(new CustomEvent('minutesChartLoaded', { detail: data }));
      window.dispatchEvent(new CustomEvent('matchStatsLoaded', { detail: data }));
      data.gameHistory.forEach(game => {
        let gameHistoryCard = document.createElement('game-history-card');
        gameHistoryCard.setAttribute('playerA', JSON.stringify(game.playerA));
        gameHistoryCard.setAttribute('playerB', JSON.stringify(game.playerB));
        gameHistoryCard.setAttribute('result', game.result);
        this.shadow.querySelector('.history-contentTab').appendChild(gameHistoryCard);
      });
    }).catch(error => console.error('Error fetching dashboard data:', error));
  }
  
  disconnectedCallback() {
    console.log('DASHBOARD is Disonnected');
  }

  static get observedAttributes() {
    return[/* array of attribute names to monitor for changes */];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
  }

// <------------------------------ Methods ------------------------------>

/**
 * 
 * @summary fetchDashboardData - Fetches data for the dashboard page
 * @returns {Promise<void>}
 */

  async  fetchDashboardData() {
    // In a real application, this would be a fetch call to your API
    // return fetch('/api/game-stats').then(response => response.json());

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalGames: 82892,
          wins: 12,
          draws: 17,
          losses: 8,
          minutesPlayed: [
            { day: 'Mon', minutes: 45 },
            { day: 'Tue', minutes: 58 },
            { day: 'Wed', minutes: 28 },
            { day: 'Thu', minutes: 38 },
            { day: 'Fri', minutes: 42 },
            { day: 'Sat', minutes: 52 },
            { day: 'Sun', minutes: 60 }
          ],
          matchStats: {
            winPercentage: 32.4,
            drawPercentage: 45.9,
            lossPercentage: 21.7
          },
          gameHistory: [
            { "playerA": { name: 'Hassan', avatarUrl: 'https://avatar.iran.liara.run/public/21', score: 0 }, result: 'defeat', "playerB": { name: 'Mehdi', avatarUrl: 'https://avatar.iran.liara.run/public/22', score: 1 } },
            { "playerA": { name: 'Hassan', avatarUrl: 'https://avatar.iran.liara.run/public/21', score: 62 }, result: 'victory', "playerB": { name: 'Mehdi', avatarUrl: 'https://avatar.iran.liara.run/public/22', score: 10 } },
            { "playerA": { name: 'Hassan', avatarUrl: 'https://avatar.iran.liara.run/public/21', score: 0 }, result: 'draw', "playerB": { name: 'Mehdi', avatarUrl: 'https://avatar.iran.liara.run/public/22', score: 0 } }
          ]
        });
      }, 500);
    });
  }
  

/**
 * 
 * @summary animateTabs - Handles the tab animation between Game Stats and Game History and both of them
 * @returns {void}
 */
  animateTabs() {
    const tabButtons = this.shadow.querySelectorAll('.tab-button');
    const tabContents = this.shadow.querySelectorAll('.tab-content');
    const contentContainer = this.shadow.querySelector('.content-container');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) =>{
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        e.target.classList.add('active');
        
        // Get the tab to show
        const tabToShow = button.getAttribute('data-tab');
        
        // Handle the animation with a slight delay for better visual effect
        if (tabToShow === 'all') {
          // First hide all tabs with animation
          tabContents.forEach(content => {
            content.classList.remove('active');
          });
          
          // After a short delay, show both tabs
          setTimeout(() => {
            tabContents.forEach(content => {
              content.classList.add('active');
            });
          }, 300);
        } else {
          // Remove all-active class
          contentContainer.classList.remove('all-active');
          
          // Hide all tabs with animation
          tabContents.forEach(content => {
            content.classList.remove('active');
          });
          
          // After a short delay, show the selected tab
          setTimeout(() => {
            console.log(tabToShow);
            let tabId = `${tabToShow}-content`;
            console.log(tabId);
            // this.shadow.getElementById(tabId).classList.add('active');
            this.shadow.getElementById(tabId).classList.add('active');
          }, 300);
        }
      });
    });
  }
}
customElements.define('dashboard-page', DASHBOARD);

export default DASHBOARD;