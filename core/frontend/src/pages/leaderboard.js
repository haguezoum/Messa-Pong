import API, { sanitizeInput } from '../services/API.js';

let template = document.createElement("template");

template.innerHTML = /*html*/`
<div id="leaderboard-page" class="leaderboard-page">
  <div class="container">
    <header-bar></header-bar>
    <div class="leaderboard-container">
      <div class="leaderboard-title">DAILY LEADERBOARD - GAME PLAYERS</div>
      <div class="stats-header">
        <div class="stats-title">ACTIVITY SCORE</div>
      </div>
      <div class="metrics-row">
        <div><div class="metric-label">Total Games</div></div>
        <div><div class="metric-label">Wins</div></div>
        <div><div class="metric-label">Defeats</div></div>
        <div><div class="metric-label">Draws</div></div>
      </div>
      <div class="leaderboard-header">
        <div>Rank</div><div>Player</div><div>Win Rate</div><div>Games</div><div>Wins</div><div>Losses</div><div>Draws</div>
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
    linkElem.setAttribute('href', '/src/assets/style/leaderboard-page.css');
    this.shadow.appendChild(linkElem);
    this.leaderboardBody = this.shadow.querySelector('.leaderboard-body');
    this.users = [];
  }

  connectedCallback() {
    this.fetchUsers();
  }

  disconnectedCallback() {
    console.log('LEADERBOARD is Disconnected');
  }

  async fetchUsers() {
    try {
      const response = await fetch('https://localhost/api/leaderboard/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const users = await response.json();
      this.users = users.map(user => ({
        id: user.id,
        name: sanitizeInput(user.username),
        avatarUrl: sanitizeInput(user.profile_picture || `https://i.pravatar.cc/150?img=${user.id}`),
        totalGames: user.total_games,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        winRate: user.win_rate,
      }));
      this.users.sort((a, b) => b.wins - a.wins); // Match backend ordering
      this.renderLeaderboard();
    } catch (error) {
      this.leaderboardBody.innerHTML = `<div class="error">Error loading leaderboard: ${error.message}</div>`;
    }
  }

  getOrdinalSuffix(number) {
    const j = number % 10, k = number % 100;
    if (j === 1 && k !== 11) return "ST";
    if (j === 2 && k !== 12) return "ND";
    if (j === 3 && k !== 13) return "RD";
    return "TH";
  }

  renderLeaderboard() {
    this.leaderboardBody.innerHTML = this.users.length === 0 ? '<div class="error">No users found</div>' : '';
    this.users.forEach((user, index) => {
      const position = index + 1;
      const suffix = this.getOrdinalSuffix(position);
      const row = document.createElement('div');
      row.className = `user-row rank-${position}`;
      row.innerHTML = `
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
}

customElements.define('leaderboard-page', LEADERBOARD);
export default LEADERBOARD;
