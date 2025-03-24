let template = document.createElement("template");

template.innerHTML = /*html*/`
<div id="leaderboard-page" class="leaderboard-page">
  <div class="container">
  <header-bar></header-bar>
    <div class="leaderboard-container">
      <div class="leaderboard-title">
        DAILY LEADERBOARD - GAME PLAYERS
      </div>
      <div class="stats-header">
        <div class="stats-title">ACTIVITY SCORE</div>
      </div>
      <div class="metrics-row">
        <div>
          <div class="metric-label">Total Games</div>
        </div>
        <div>
          <div class="metric-label">Wins</div>
        </div>
        <div>
          <div class="metric-label">Defeats</div>
        </div>
        <div>
          <div class="metric-label">Draws</div>
        </div>
      </div>
      <div class="leaderboard-header">
        <div>Rank</div>
        <div>Player</div>
        <div>Win Rate</div>
        <div>Games</div>
        <div>Wins</div>
        <div>Losses</div>
        <div>Draws</div>
      </div>
      <div class="leaderboard-body">
        <div class="loading">Loading leaderboard data...</div>
      </div>
    </div>
  </div>
  <cloud-moving></cloud-moving>
</div>`;

class LEADERBOARD extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/leaderboard-page.css');
    this.shadow.appendChild(linkElem);
    // ------------------------------
    this.leaderboardBody = this.shadow.querySelector('.leaderboard-body');
    this.users = [];
  }

  connectedCallback() {
    this.fetchUsers();
  }
  
  disconnectedCallback() {
    console.log('LEADERBOARD is Disconnected');
  }

  static get observedAttributes() {
    return["data-url"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-url" && oldValue !== newValue) {
      this.fetchUsers();
    }
  }
  
  // ------------------------------ Methods ------------------------------

  async fetchUsers() {
    try {
      // Get API URL from attribute or use default
      const apiUrl = this.getAttribute('data-url') || 'https://jsonplaceholder.typicode.com/users';
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const users = await response.json();
      console.log(users.length);
      // Add game statistics for demonstration purposes
      this.users = users.map(user => {
        const totalGames = Math.floor(Math.random() * 100) + 20;
        const wins = Math.floor(Math.random() * totalGames);
        const draws = Math.floor(Math.random() * (totalGames - wins));
        const losses = totalGames - wins - draws;
        const winRate = (wins / totalGames) * 100;
        
        return {
          id: user.id,
          name: user.name,
          avatarUrl: `https://i.pravatar.cc/150?img=${user.id}`,
          totalGames,
          wins,
          losses,
          draws,
          winRate: Math.round(winRate)
        };
      });
      
      // Sort users by win rate (highest first)
      this.users.sort((a, b) => b.winRate - a.winRate);
      
      this.renderLeaderboard();
    } catch (error) {
      this.leaderboardBody.innerHTML = `
        <div class="error">
          Error loading leaderboard: ${error.message}
        </div>
      `;
    }
  }
  
  // ------------------------------
  getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    
    if (j === 1 && k !== 11) {
      return "ST";
    }
    if (j === 2 && k !== 12) {
      return "ND";
    }
    if (j === 3 && k !== 13) {
      return "RD";
    }
    return "TH";
  }
  
  renderLeaderboard() {
    if (this.users.length === 0) {
      this.leaderboardBody.innerHTML = `
        <div class="error">No users found</div>
      `;
      return;
    }
    
    this.leaderboardBody.innerHTML = '';
    
    this.users.forEach((user, index) => {
      const position = index + 1;
      const suffix = this.getOrdinalSuffix(position);
      const row = document.createElement('div');
      row.className = `user-row rank-${position}`;
      
      row.innerHTML = /*html*/`
        <div class="position">
          <span class="position-number">${position}</span>
          <span class="position-suffix">${suffix}</span>
        </div>
        <div class="user-info">
          <img class="avatar" src="${user.avatarUrl}" alt="${user.name}'s avatar">
          <div class="user-name">${user.name}</div>
        </div>
        <div class="score-container">
          <div class="progress-bar">
            <div class="progress" style="width: ${user.winRate}%"></div>
          </div>
          <div class="score-value">${user.winRate}%</div>
        </div>
        <div class="stat-value">${user.totalGames}</div>
        <div class="stat-value">${user.wins}</div>
        <div class="stat-value">${user.losses}</div>
        <div class="stat-value">${user.draws}</div>
      `;
      
      this.leaderboardBody.appendChild(row);
    });
  }
  // ------------------------------
}
customElements.define('leaderboard-page', LEADERBOARD);

export default LEADERBOARD;