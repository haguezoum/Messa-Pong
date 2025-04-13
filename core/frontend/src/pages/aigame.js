let template = document.createElement("template");

template.innerHTML = 
  /*html*/
`<div class="game-container">
    <!-- Floating elements for background effect -->
    <div class="floating-elements">
      <div class="floating-element" style="--delay: 0s; --size: 28px; --top: 15%; --left: 8%; --seed: 1.2;"><i class="fas fa-gamepad"></i></div>
      <div class="floating-element" style="--delay: 1.5s; --size: 22px; --top: 25%; --left: 85%; --seed: 0.8;"><i class="fas fa-robot"></i></div>
      <div class="floating-element" style="--delay: 0.8s; --size: 24px; --top: 65%; --left: 92%; --seed: 1.5;"><i class="fas fa-table-tennis"></i></div>
      <div class="floating-element" style="--delay: 2.2s; --size: 30px; --top: 80%; --left: 12%; --seed: 0.5;"><i class="fas fa-trophy"></i></div>
      <div class="floating-element" style="--delay: 3s; --size: 20px; --top: 40%; --left: 50%; --seed: 1.8;"><i class="fas fa-chess-king"></i></div>
    </div>
    
    <!-- Particles container -->
    <div class="particles-container"></div>
    <div class="game-header">
      <div class="game-title-container">
        <h1 class="game-title" data-text="META PONG">META PONG</h1>
        <div class="title-glow-effect"></div>
      </div>
      <div class="status-container">
        <div id="game-status">Press Start to Play</div>
        <div class="settings-wrapper">
          <div id="current-difficulty" class="current-difficulty">Medium</div>
          <div id="settings-icon" class="settings-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="score-board">
      <div class="score">
        <div class="player-label">You</div>
        <div id="player1-score">0</div>
      </div>
      <div class="vs-badge">VS</div>
      <div class="score">
        <div class="player-label">AI</div>
        <div id="player2-score">0</div>
      </div>
    </div>

    <canvas id="gameCanvas" width="800" height="500"></canvas>

    <div class="game-controls">
      <button id="startButton" class="primary-button">
        <span class="button-text">Start Game</span>
        <span class="button-glow"></span>
      </button>
      <button id="resetButton">
        <span class="button-text">Reset Game</span>
        <span class="button-glow"></span>
      </button>
      <button id="backButton">
        <span class="button-text">Go Back</span>
        <span class="button-glow"></span>
      </button>
    </div>
    
    <!-- Difficulty Settings Panel -->
    <div id="difficulty-panel" class="difficulty-panel">
      <div class="difficulty-header">
        <h3>AI Difficulty</h3>
        <span class="close-panel">&times;</span>
      </div>
      <div class="difficulty-options">
        <div id="easy-btn" class="difficulty-option" data-difficulty="easy">
          <input type="radio" name="difficulty" id="easy-radio">
          <div class="difficulty-label">Easy</div>
          <div class="difficulty-description">Slower AI movement, perfect for beginners</div>
        </div>
        <div id="medium-btn" class="difficulty-option" data-difficulty="medium">
          <input type="radio" name="difficulty" id="medium-radio" checked>
          <div class="difficulty-label">Medium</div>
          <div class="difficulty-description">Balanced AI speed and reaction time</div>
        </div>
        <div id="hard-btn" class="difficulty-option" data-difficulty="hard">
          <input type="radio" name="difficulty" id="hard-radio">
          <div class="difficulty-label">Hard</div>
          <div class="difficulty-description">Fast AI with quick reactions, a real challenge</div>
        </div>
      </div>
    </div>
    
    <!-- Overlay for the settings panel -->
    <div id="settings-overlay" class="settings-overlay"></div>
</div>

<!-- Victory Overlay -->
<div id="victory-overlay">
  <div class="confetti-container"></div>
  <div class="victory-content">
    <div class="victory-flames"></div>
    <div class="victory-spotlight"></div>
    <div class="victory-particles"></div>
    <div class="trophy-container">
      <div class="trophy-glow"></div>
      <div class="trophy-rotate">
        <div class="trophy-icon">
          <i class="fas fa-trophy"></i>
        </div>
      </div>
      <div class="victory-stars">
        <i class="fas fa-star star-1"></i>
        <i class="fas fa-star star-2"></i>
        <i class="fas fa-star star-3"></i>
      </div>
    </div>
    <h2 id="victory-title" class="victory-title" data-text="Victory!">Victory!</h2>
    <p class="victory-message">Congratulations! <i class="fas fa-medal"></i> <i class="fas fa-star"></i></p>
    <div id="final-score" class="victory-score">0 - 0</div>
    <div class="stat-container">
      <div class="match-stats">
        <div class="stat-item">
          <span class="stat-label"><i class="fas fa-clock"></i> Time</span>
          <span id="game-time" class="stat-value">00:00</span>
        </div>
        <div class="stat-item">
          <span class="stat-label"><i class="fas fa-table-tennis"></i> Hits</span>
          <span id="hit-count" class="stat-value">0</span>
        </div>
        <div class="stat-item">
          <span class="stat-label"><i class="fas fa-bolt"></i> Difficulty</span>
          <span id="difficulty-display" class="stat-value">Medium</span>
        </div>
      </div>
    </div>
    <div class="victory-buttons">
      <button id="rematch-button" class="victory-button primary-button">
        <i class="fas fa-redo-alt"></i> Rematch
      </button>
      <button id="back-home-button" class="victory-button">
        <i class="fas fa-home"></i> Back Home
      </button>
    </div>
  </div>
</div>`;

class AIGamePage extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
    
    // Add required external stylesheets
    this.addExternalStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
    this.addExternalStylesheet('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap');
    
    // Add component stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', 'src/assets/style/aigame-page.css');
    this.shadow.appendChild(linkElem);
    
    this.checkCanvasInterval = null;
  }

  addExternalStylesheet(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  connectedCallback() {
    console.log("AIGamePage is Connected");
    
    // Setup event listeners for buttons
    this.setupEventListeners();
    
    // Initialize the game
    this.initGame();
    
    // Setup difficulty panel
    this.setupDifficultyPanel();
    
    // Apply title animation
    this.setupTitleAnimation();
    
    // Generate background particles
    this.generateParticles();
    
    // Setup confetti effect for victory screen
    this.setupConfetti();
  }
  
  setupTitleAnimation() {
    const titleStyle = document.createElement('style');
    titleStyle.textContent = `
      .game-title-container {
        position: relative;
        display: inline-block;
      }
      
      .game-title {
        font-size: 2.8em;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 4px;
        color: #ffffff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4);
        position: relative;
        z-index: 2;
      }
      
      .game-title::before {
        content: attr(data-text);
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.3;
        color: rgba(255, 255, 255, 0.4);
        animation: neon-pulse 2s infinite alternate;
      }
      
      .title-glow-effect {
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
        transform: translateY(10px);
        filter: blur(5px);
        opacity: 0.7;
        z-index: 1;
        animation: scan-line 3s linear infinite;
      }
      
      @keyframes neon-pulse {
        0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.6); }
        100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4); }
      }
      
      /* Score animation keyframes */
      @keyframes score-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.5); color: #ffdd00; text-shadow: 0 0 15px rgba(255, 221, 0, 0.8); }
        100% { transform: scale(1); }
      }
      
      @keyframes goal-flash {
        0% { background-color: rgba(255, 255, 255, 0); }
        25% { background-color: rgba(255, 255, 255, 0.3); }
        50% { background-color: rgba(255, 255, 255, 0); }
        75% { background-color: rgba(255, 255, 255, 0.3); }
        100% { background-color: rgba(255, 255, 255, 0); }
      }
      
      .score-animation {
        animation: score-pulse 0.7s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      
      .score-container-flash {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
        pointer-events: none;
        animation: goal-flash 0.6s ease-out;
        border-radius: 8px;
      }
      
      @keyframes scan-line {
        0% { transform: translateY(10px) translateX(-100%); }
        100% { transform: translateY(10px) translateX(100%); }
      }
      
      /* Color transformations for victory and game over screens */
      .game-over-active .game-header,
      .game-over-active .score-board,
      .game-over-active #gameCanvas {
        filter: hue-rotate(130deg) saturate(2) brightness(0.8) !important;
        transition: filter 1s ease-in-out;
      }
      
      /* Victory mode gets a gold filter */
      .victory-active .game-header,
      .victory-active .score-board,
      .victory-active #gameCanvas {
        filter: sepia(0.5) saturate(1.5) !important;
        transition: filter 1s ease-in-out;
      }
      
      /* Game Over button styling */
      .game-over-active button, 
      .game-over-active .primary-button,
      .game-over-active #startButton,
      .game-over-active #resetButton,
      .game-over-active #backButton {
        background: linear-gradient(145deg, #990000, #770000) !important;
        box-shadow: 0 4px 10px rgba(100, 0, 0, 0.3) !important;
        border-color: #550000 !important;
      }
      
      .game-over-active button:hover,
      .game-over-active .primary-button:hover {
        background: linear-gradient(145deg, #aa0000, #880000) !important;
        box-shadow: 0 6px 15px rgba(150, 0, 0, 0.4) !important;
      }
      
      /* Game Over styling */
      .game-over-title {
        color: #ff0000 !important;
        text-shadow: 0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.6) !important;
        animation: game-over-pulse 1.5s infinite alternate;
        font-size: 3.5em !important;
        letter-spacing: 4px !important;
        transform: skewX(-8deg) !important;
        font-weight: 900 !important;
        position: relative;
        z-index: 3;
      }
      
      @keyframes text-glitch {
        0%, 100% { clip-path: inset(0 0 0 0); }
        5% { clip-path: inset(0.1em 0 0.2em 0); }
        10% { clip-path: inset(0.2em 0 0.1em 0); }
        15%, 85% { clip-path: inset(0 0 0 0); }
        90% { clip-path: inset(0.3em 0 0.1em 0); }
        95% { clip-path: inset(0.1em 0 0.3em 0); }
      }
      
      .game-over-title::before,
      .game-over-title::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      
      .game-over-title::before {
        color: #ff6666;
        animation: text-glitch 3s infinite linear alternate-reverse;
        left: -2px;
        text-shadow: 1px 0 #990000;
      }
      
      .game-over-title::after {
        color: #ff3333;
        animation: text-glitch 2.5s infinite linear alternate-reverse;
        left: 2px;
        text-shadow: -1px 0 #cc0000;
      }
      
      .game-over-message {
        color: #ffaaaa !important;
        font-size: 1.4em !important;
        letter-spacing: 1px !important;
        margin-top: 10px !important;
        font-style: italic !important;
      }
      
      .game-over-content {
        position: relative;
        overflow: hidden;
      }
      
      .game-over-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(40, 0, 0, 0.9), rgba(100, 0, 0, 0.5));
        z-index: -1;
        animation: dark-pulse 3s infinite alternate;
        box-shadow: inset 0 0 50px rgba(255, 0, 0, 0.3);
        border: 1px solid rgba(255, 0, 0, 0.2);
      }
      
      .game-over-content::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M0,50 L100,50" stroke="%23ff0000" stroke-width="0.5" stroke-opacity="0.1"/><path d="M50,0 L50,100" stroke="%23ff0000" stroke-width="0.5" stroke-opacity="0.1"/><circle cx="50" cy="50" r="40" stroke="%23ff0000" stroke-width="0.5" stroke-opacity="0.05" fill="none"/><circle cx="50" cy="50" r="30" stroke="%23ff0000" stroke-width="0.5" stroke-opacity="0.05" fill="none"/><circle cx="50" cy="50" r="20" stroke="%23ff0000" stroke-width="0.5" stroke-opacity="0.05" fill="none"/></svg>');
        z-index: -1;
        opacity: 0.3;
        pointer-events: none;
        animation: rotate-background 30s linear infinite;
      }
      
      @keyframes rotate-background {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .game-over-content .trophy-icon {
        background: linear-gradient(135deg, #700, #f33) !important;
        transform: rotate(180deg) !important;
        animation: broken-trophy 6s ease infinite;
      }
      
      .game-over-content .trophy-glow {
        background: radial-gradient(circle, rgba(255, 0, 0, 0.7) 0%, rgba(255, 0, 0, 0) 70%) !important;
        animation: red-glow 3s infinite alternate;
      }
      
      .game-over-content .victory-score {
        color: #ff6666 !important;
        text-shadow: 0 0 8px rgba(255, 0, 0, 0.6) !important;
        font-size: 2.2em !important;
        margin: 15px 0 !important;
      }
      
      .game-over-content .victory-button {
        background: linear-gradient(to bottom, #660000, #990000) !important;
        border-color: #440000 !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 100, 100, 0.3) !important;
        transform: scale(1.05) !important;
        position: relative;
        overflow: hidden;
      }
      
      .game-over-content .victory-button::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: linear-gradient(45deg, #ff0000, transparent, #ff0000, transparent);
        background-size: 400% 400%;
        opacity: 0.3;
        z-index: -1;
        animation: game-over-button-gradient 3s ease infinite;
      }
      
      @keyframes game-over-button-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .game-over-content .victory-button:hover {
        background: linear-gradient(to bottom, #770000, #aa0000) !important;
        transform: scale(1.1) translateY(-5px) !important;
        box-shadow: 0 8px 20px rgba(255, 0, 0, 0.4), inset 0 1px 0 rgba(255, 150, 150, 0.5) !important;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.7) !important;
      }
      
      .game-over-content .victory-button:active {
        transform: scale(0.98) translateY(2px) !important;
        box-shadow: 0 3px 10px rgba(255, 0, 0, 0.3), inset 0 1px 0 rgba(255, 150, 150, 0.3) !important;
      }
      
      .game-over-content .game-over-flames {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,50 Q10,30 20,50 T40,50 T60,50 T80,50 T100,50 V0 H0 Z" fill="%23ff3300" /></svg>');
        background-size: 100px 100%;
        opacity: 0.8;
        transform: scaleY(-1);
        filter: blur(2px);
        animation: flame-move 3s linear infinite;
        pointer-events: none;
        z-index: 2;
      }
      
      .game-over-skull {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        color: rgba(255, 255, 255, 0.8);
        z-index: 10;
        animation: skull-float 2s ease-in-out infinite alternate;
      }
      
      @keyframes skull-float {
        0% { transform: translateX(-50%) translateY(0); }
        100% { transform: translateX(-50%) translateY(-5px); }
      }
      
      @keyframes flame-move {
        0% { background-position: 0 0; }
        100% { background-position: 100px 0; }
      }
      
      @keyframes game-over-pulse {
        0% { text-shadow: 0 0 10px rgba(255, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); transform: scale(1) skewX(-8deg); filter: brightness(0.9); }
        50% { text-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.6), 0 0 45px rgba(255, 0, 0, 0.4); transform: scale(1.05) skewX(-8deg); filter: brightness(1.1); }
        100% { text-shadow: 0 0 10px rgba(255, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); transform: scale(1) skewX(-8deg); filter: brightness(0.9); }
      }

      /* Victory screen styling */
      .victory-title {
        color: #ffcc00 !important;
        text-shadow: 0 0 10px rgba(255, 204, 0, 0.8), 0 0 20px rgba(255, 204, 0, 0.6) !important;
        animation: victory-title-pulse 1.5s infinite alternate;
        font-size: 3.5em !important;
        letter-spacing: 4px !important;
        font-weight: 900 !important;
        position: relative;
        z-index: 3;
        transform: skewX(-5deg);
      }
      
      @keyframes victory-title-pulse {
        0% { text-shadow: 0 0 10px rgba(255, 204, 0, 0.6), 0 0 20px rgba(255, 204, 0, 0.4); transform: scale(1) skewX(-5deg); filter: brightness(0.9); }
        50% { text-shadow: 0 0 15px rgba(255, 204, 0, 0.8), 0 0 30px rgba(255, 204, 0, 0.6), 0 0 45px rgba(255, 204, 0, 0.4); transform: scale(1.05) skewX(-5deg); filter: brightness(1.1); }
        100% { text-shadow: 0 0 10px rgba(255, 204, 0, 0.6), 0 0 20px rgba(255, 204, 0, 0.4); transform: scale(1) skewX(-5deg); filter: brightness(0.9); }
      }
      
      .victory-title::before,
      .victory-title::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      
      .victory-title::before {
        color: #ffaa33;
        animation: text-glitch 3s infinite linear alternate-reverse;
        left: -2px;
        text-shadow: 1px 0 #cc9900;
      }
      
      .victory-title::after {
        color: #ff9900;
        animation: text-glitch 2.5s infinite linear alternate-reverse;
        left: 2px;
        text-shadow: -1px 0 #ffcc00;
      }
      
      .victory-message {
        color: #ffffff !important;
        font-size: 1.4em !important;
        letter-spacing: 1px !important;
        margin-top: 10px !important;
        font-weight: 500 !important;
        text-shadow: 0 0 5px rgba(255, 204, 0, 0.5) !important;
      }
      
      .victory-message i {
        color: #ffcc00;
        animation: icon-float 1.5s infinite alternate;
        margin: 0 5px;
      }
      
      @keyframes icon-float {
        0% { transform: translateY(0); }
        100% { transform: translateY(-5px); }
      }
      
      .trophy-container {
        margin-bottom: 20px;
        position: relative;
      }
      
      .trophy-icon {
        font-size: 60px;
        color: #ffcc00;
        animation: trophy-bounce 1.5s ease-in-out infinite alternate;
        filter: drop-shadow(0 0 15px rgba(255, 204, 0, 0.6));
        position: relative;
        z-index: 2;
      }
      
      @keyframes trophy-bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-10px); }
      }
      
      .trophy-glow {
        position: absolute;
        width: 120px;
        height: 120px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(255, 204, 0, 0.8) 0%, rgba(255, 204, 0, 0) 70%);
        border-radius: 50%;
        animation: glow-pulse 2.5s infinite alternate;
        filter: blur(8px);
        z-index: 1;
      }
      
      @keyframes glow-pulse {
        0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.9); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      }
      
      .victory-stars {
        position: absolute;
        top: -25px;
        left: 0;
        right: 0;
        text-align: center;
        color: #ffcc00;
        font-size: 18px;
        text-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
        z-index: 5;
      }
      
      .victory-stars i {
        margin: 0 5px;
        animation: stars-twinkle 1.5s infinite alternate;
        animation-delay: calc(var(--i, 0) * 0.3s);
      }
      
      .victory-stars i:nth-child(1) { --i: 0; }
      .victory-stars i:nth-child(2) { --i: 1; }
      .victory-stars i:nth-child(3) { --i: 2; }
      
      @keyframes stars-twinkle {
        0% { opacity: 0.7; transform: translateY(0) scale(1); }
        100% { opacity: 1; transform: translateY(-5px) scale(1.2); }
      }
      
      .victory-score {
        font-size: 2.5em;
        margin: 15px 0;
        color: #fff;
        text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
        font-weight: bold;
        position: relative;
        padding: 10px 20px;
        border-radius: 8px;
        background: rgba(60, 60, 0, 0.2);
        display: inline-block;
        border: 1px solid rgba(255, 204, 0, 0.2);
      }
      
      .victory-flames {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,50 Q10,30 20,50 T40,50 T60,50 T80,50 T100,50 V0 H0 Z" fill="%23ffcc00" /></svg>');
        background-size: 100px 100%;
        opacity: 0.8;
        transform: scaleY(-1);
        filter: blur(2px);
        animation: flame-move 3s linear infinite;
        pointer-events: none;
        z-index: 2;
      }
      
      .victory-content {
        position: relative;
        overflow: hidden;
      }
      
      .victory-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(60, 60, 0, 0.6), rgba(30, 30, 0, 0.3));
        z-index: -1;
        animation: victory-background-pulse 4s infinite alternate;
        box-shadow: inset 0 0 50px rgba(255, 204, 0, 0.2);
        border: 1px solid rgba(255, 204, 0, 0.2);
        border-radius: 10px;
      }
      
      @keyframes victory-background-pulse {
        0% { opacity: 0.7; }
        100% { opacity: 0.9; }
      }
      
      .victory-button {
        background: linear-gradient(to bottom, #ccaa00, #ffcc00);
        border: 2px solid #cc9900;
        color: #ffffff;
        padding: 10px 20px;
        font-size: 16px;
        border-radius: 8px;
        margin: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        outline: none;
        position: relative;
        font-weight: bold;
        min-width: 150px;
      }
      
      .victory-button i {
        margin-right: 8px;
      }
      
      .victory-button:hover {
        background: linear-gradient(to bottom, #ddbb00, #ffdd00);
        transform: scale(1.05) translateY(-3px);
        box-shadow: 0 8px 20px rgba(204, 153, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      }
      
      .victory-button:active {
        transform: scale(0.98) translateY(1px);
        box-shadow: 0 2px 10px rgba(204, 153, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
      
      .victory-button.primary-button {
        background: linear-gradient(to bottom, #ddaa00, #ffbb00);
        border-color: #cc8800;
        box-shadow: 0 5px 15px rgba(204, 153, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5);
      }
      
      .victory-button.primary-button:hover {
        background: linear-gradient(to bottom, #eebb00, #ffcc00);
        box-shadow: 0 8px 20px rgba(204, 153, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6);
      }
      
      @keyframes dark-pulse {
        0% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      @keyframes broken-trophy {
        0% { transform: rotate(180deg); }
        3% { transform: rotate(178deg); }
        6% { transform: rotate(180deg); }
        9% { transform: rotate(182deg); }
        12% { transform: rotate(180deg); }
        100% { transform: rotate(180deg); }
      }
      
      @keyframes red-glow {
        0% { opacity: 0.7; transform: scale(1); }
        100% { opacity: 0.9; transform: scale(1.2); }
      }
      
      /* Stats styling */
      .stat-container {
        margin: 15px 0;
        display: flex;
        justify-content: center;
      }
      
      .match-stats {
        display: flex;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 10px 20px;
        gap: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }
      
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .stat-label {
        font-size: 0.8em;
        opacity: 0.8;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .stat-value {
        font-size: 1.2em;
        font-weight: bold;
      }
      
      .game-over-content .stat-container .match-stats {
        background: rgba(80, 0, 0, 0.3);
        border: 1px solid rgba(255, 0, 0, 0.2);
        box-shadow: 0 5px 15px rgba(100, 0, 0, 0.3), inset 0 0 10px rgba(255, 0, 0, 0.1);
      }
      
      .game-over-content .stat-label {
        color: #ffcccc;
      }
      
      .game-over-content .stat-value {
        color: #ff6666;
        text-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
      }
      
      /* Ensure all remaining blue UI elements turn red in game over mode */
      .game-over-active .game-canvas-container,
      .game-over-active .score-display,
      .game-over-active .game-status,
      .game-over-active .difficulty-level,
      .game-over-active .slider-container,
      .game-over-active .settings-panel {
        color: #ffaaaa !important;
        border-color: #770000 !important;
      }
      
      .game-over-active a,
      .game-over-active .link-text,
      .game-over-active .nav-link {
        color: #ff3333 !important;
        text-shadow: 0 0 3px rgba(150, 0, 0, 0.3) !important;
      }
      
      .game-over-content .stat-label i {
        margin-right: 5px;
        animation: icon-pulse 2s infinite alternate;
      }
      
      @keyframes icon-pulse {
        0% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      /* Enhanced game control buttons */
      .game-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
      }
      
      .game-controls button {
        position: relative;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.5px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, rgba(14, 12, 40, 0.9), rgba(25, 25, 50, 0.9));
        color: #fff;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.05);
        text-transform: uppercase;
      }
      
      .game-controls button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: all 0.4s ease;
      }
      
      .game-controls button:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.1);
      }
      
      .game-controls button:hover::before {
        left: 100%;
        transition: all 0.7s ease;
      }
      
      .game-controls button:active {
        transform: translateY(1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      /* Specific button styling for each button */
      .game-controls #startButton {
        background: linear-gradient(135deg, rgba(14, 12, 40, 0.9), rgba(25, 25, 50, 0.9));
      }
      
      .game-controls #resetButton {
        background: linear-gradient(135deg, rgba(14, 12, 40, 0.9), rgba(25, 25, 50, 0.9));
      }
      
      .game-controls #backButton {
        background: linear-gradient(135deg, rgba(14, 12, 40, 0.9), rgba(25, 25, 50, 0.9));
      }
      
      /* Button glow effects */
      .button-text {
        position: relative;
        z-index: 2;
      }
      
      .button-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
        border-radius: 8px;
      }
      
      .game-controls button:hover .button-glow {
        opacity: 1;
        animation: button-pulse 1.5s infinite alternate;
      }
      
      @keyframes button-pulse {
        0% { opacity: 0.3; }
        100% { opacity: 0.7; }
      }
    `;
    this.shadow.appendChild(titleStyle);
  }

  setupConfetti() {
    const createConfetti = () => {
      const confettiContainer = this.shadow.querySelector('.confetti-container');
      if (!confettiContainer) return;
      
      confettiContainer.innerHTML = '';
      
      // Create more confetti pieces with varied animations
      for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // More varied positions
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -Math.random() * 20 - 10 + '%';
        
        // Varied animation properties
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.animationDuration = Math.random() * 3 + 3 + 's';
        
        // Varied sizes
        const size = Math.random() * 8 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // More varied colors with brighter options
        confetti.style.backgroundColor = this.getRandomBrightColor();
        
        // Varied shapes
        if (Math.random() > 0.5) {
          confetti.style.borderRadius = '50%';
        } else if (Math.random() > 0.5) {
          confetti.style.borderRadius = '0';
        } else {
          confetti.style.borderRadius = '5px';
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        confettiContainer.appendChild(confetti);
      }
    };
    
    // Create spotlight and particle effects for the victory screen
    this.setupVictoryEffects();
    
    // Function to trigger confetti when victory overlay is shown
    const victoryOverlay = this.shadow.getElementById('victory-overlay');
    if (victoryOverlay) {
      // Create a MutationObserver to watch for class changes on the victory overlay
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (victoryOverlay.classList.contains('active')) {
              createConfetti();
              this.playVictoryAnimation();
              
              // Refresh confetti every few seconds for continued effect
              const confettiInterval = setInterval(createConfetti, 4000);
              
              // Store the interval ID to clear it when needed
              this.confettiInterval = confettiInterval;
              
              // Play victory sound if available
              this.playVictorySound();
            } else {
              // Clear the interval when the victory overlay is hidden
              if (this.confettiInterval) {
                clearInterval(this.confettiInterval);
                this.confettiInterval = null;
              }
            }
          }
        });
      });
      
      // Start observing the victory overlay for class changes
      observer.observe(victoryOverlay, { attributes: true });
    }
  }
  
  // Helper method to get bright colors for confetti
  getRandomBrightColor() {
    const brightColors = [
      '#FF0000', '#FF5E00', '#FFBD00', '#FFE800', '#8FFF00', 
      '#00FF41', '#00FFFF', '#008FFF', '#0033FF', '#4B00FF', 
      '#8F00FF', '#FF00FF', '#FF0077', '#FF77FF', '#FFDD00'
    ];
    return brightColors[Math.floor(Math.random() * brightColors.length)];
  }
  
  // Create advanced victory effects
  setupVictoryEffects() {
    // Add custom styles for the enhanced victory screen
    const victoryStyle = document.createElement('style');
    victoryStyle.textContent = `
      /* Enhanced Victory Overlay Styles */
      #victory-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(25, 25, 60, 0.9) 0%, rgba(15, 15, 40, 0.95) 100%);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.5s ease, visibility 0.5s ease;
        backdrop-filter: blur(6px);
      }
      
      #victory-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .confetti-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
      }
      
      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #f00;
        opacity: 0.8;
        animation: fall 4s linear forwards;
      }
      
      @keyframes fall {
        0% {
          transform: translateY(-10%) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      .victory-content {
        position: relative;
        background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(20, 20, 50, 0.9));
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.6), 0 0 60px rgba(100, 100, 255, 0.2);
        border: 1px solid rgba(100, 150, 255, 0.3);
        overflow: hidden;
        animation: appear 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        transform: scale(0.9);
      }
      
      @keyframes appear {
        0% {
          transform: scale(0.9);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      .victory-spotlight {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%);
        animation: rotate-spotlight 8s linear infinite;
        pointer-events: none;
        z-index: 0;
      }
      
      @keyframes rotate-spotlight {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .victory-particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 0;
      }
      
      .victory-flames {
        position: absolute;
        bottom: -30px;
        left: 0;
        width: 100%;
        height: 100px;
        background: linear-gradient(to top, rgba(255, 120, 50, 0.8), rgba(255, 120, 50, 0) 80%);
        filter: blur(20px);
        animation: flicker 3s ease-in-out infinite alternate;
        opacity: 0.7;
        z-index: 0;
      }
      
      @keyframes flicker {
        0%, 100% { opacity: 0.7; height: 100px; }
        50% { opacity: 0.5; height: 90px; }
      }
      
      /* Trophy enhancements */
      .trophy-container {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 20px;
        perspective: 600px;
      }
      
      .trophy-rotate {
        width: 100%;
        height: 100%;
        animation: trophy-float 3s ease-in-out infinite, trophy-rotate 20s linear infinite;
        transform-style: preserve-3d;
      }
      
      @keyframes trophy-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes trophy-rotate {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      
      .trophy-icon {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: gold;
        font-size: 5em;
        text-shadow: 0 0 20px rgba(255, 223, 0, 0.8);
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.05); filter: brightness(1.2); }
      }
      
      .trophy-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background: radial-gradient(circle at center, rgba(255, 215, 0, 0.6) 0%, rgba(255, 215, 0, 0) 70%);
        border-radius: 50%;
        animation: glow-pulse 2s ease-in-out infinite alternate;
        filter: blur(10px);
      }
      
      @keyframes glow-pulse {
        0% { transform: scale(0.9); opacity: 0.7; }
        100% { transform: scale(1.1); opacity: 0.9; }
      }
      
      .victory-stars {
        position: absolute;
        width: 200%;
        height: 100%;
        top: -30%;
        left: -50%;
        font-size: 1.5em;
        color: gold;
      }
      
      .victory-stars i {
        position: absolute;
        animation: twinkle 3s ease-in-out infinite;
      }
      
      .star-1 {
        top: 40%;
        left: 30%;
        animation-delay: 0s !important;
      }
      
      .star-2 {
        top: 20%;
        left: 70%;
        animation-delay: 0.4s !important;
      }
      
      .star-3 {
        top: 60%;
        left: 60%;
        animation-delay: 0.8s !important;
      }
      
      @keyframes twinkle {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.4); opacity: 1; filter: drop-shadow(0 0 10px gold); }
      }
      
      /* Title animations */
      .victory-title {
        position: relative;
        font-size: 3em;
        font-weight: 800;
        margin: 0 0 10px;
        color: #ffffff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        animation: text-glow 2s ease-in-out infinite alternate;
        letter-spacing: 3px;
      }
      
      .victory-title::before {
        content: attr(data-text);
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.8;
        filter: blur(8px);
        animation: text-blur 4s ease-in-out infinite alternate;
        z-index: -1;
      }
      
      @keyframes text-glow {
        0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
        100% { text-shadow: 0 0 20px rgba(100, 200, 255, 0.8), 0 0 30px rgba(100, 200, 255, 0.6); }
      }
      
      @keyframes text-blur {
        0% { filter: blur(8px); opacity: 0.8; }
        100% { filter: blur(12px); opacity: 1; }
      }
      
      /* Enhanced stats display */
      .stat-container {
        background: rgba(0, 20, 60, 0.4);
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(100, 150, 255, 0.2);
        animation: fade-slide-up 0.6s ease-out forwards;
        animation-delay: 0.3s;
        opacity: 0;
        transform: translateY(20px);
      }
      
      @keyframes fade-slide-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .match-stats {
        display: flex;
        justify-content: space-around;
      }
      
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .stat-label {
        color: rgba(200, 200, 255, 0.7);
        font-size: 0.9em;
        margin-bottom: 5px;
      }
      
      .stat-value {
        color: #ffffff;
        font-size: 1.2em;
        font-weight: 600;
        text-shadow: 0 0 10px rgba(100, 200, 255, 0.6);
      }
      
      /* Enhanced buttons */
      .victory-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        animation: fade-slide-up 0.6s ease-out forwards;
        animation-delay: 0.5s;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .victory-button {
        position: relative;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(30, 40, 80, 0.9), rgba(20, 25, 50, 0.9));
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }
      
      .victory-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: all 0.5s ease;
      }
      
      .victory-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 7px 20px rgba(0, 0, 0, 0.4);
      }
      
      .victory-button:hover::before {
        left: 100%;
      }
      
      .victory-button.primary-button {
        background: linear-gradient(135deg, rgba(50, 100, 180, 0.9), rgba(30, 60, 120, 0.9));
      }
      
      .victory-button i {
        margin-right: 8px;
      }
      
      .victory-score {
        font-size: 2.5em;
        font-weight: 700;
        margin: 10px 0;
        color: #ffffff;
        text-shadow: 0 0 15px rgba(100, 200, 255, 0.7);
        animation: score-appear 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        opacity: 0;
        transform: scale(0.9);
      }
      
      @keyframes score-appear {
        0% { opacity: 0; transform: scale(0.9); }
        70% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      /* Victory message enhancements */
      .victory-message {
        font-size: 1.3em;
        color: rgba(255, 255, 255, 0.9);
        margin: 10px 0;
        font-weight: 500;
        letter-spacing: 1px;
      }
      
      .victory-message i {
        color: gold;
        margin: 0 5px;
        animation: bounce 1s ease infinite alternate;
      }
      
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-5px); }
      }
    `;
    this.shadow.appendChild(victoryStyle);
  }
  
  // Play animations when victory screen shows
  playVictoryAnimation() {
    // Animate the victory title with a typing effect
    const victoryTitle = this.shadow.getElementById('victory-title');
    if (victoryTitle) {
      victoryTitle.style.opacity = '0';
      victoryTitle.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        victoryTitle.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        victoryTitle.style.opacity = '1';
        victoryTitle.style.transform = 'scale(1)';
      }, 300);
    }
    
    // Add particles to the victory screen
    const particlesContainer = this.shadow.querySelector('.victory-particles');
    if (particlesContainer) {
      particlesContainer.innerHTML = '';
      
      // Create floating particles
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = `${Math.random() * 8 + 4}px`;
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(${Math.floor(Math.random() * 155) + 100}, ${Math.floor(Math.random() * 155) + 100}, 255, ${Math.random() * 0.5 + 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.filter = 'blur(1px)';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.opacity = '0.7';
        
        const floatKeyframes = `
          @keyframes float {
            0% { transform: translate(0, 0); }
            25% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
            50% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
            75% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px); }
            100% { transform: translate(0, 0); }
          }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = floatKeyframes;
        document.head.appendChild(styleSheet);
        
        particlesContainer.appendChild(particle);
      }
    }
  }
  
  // Add victory sound effect
  playVictorySound() {
    // Create an AudioContext
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      
      // Create a victory fanfare
      this.playFanfare(audioContext);
    } catch (e) {
      console.log('Web Audio API is not supported in this browser');
    }
  }
  
  // Create a simple victory fanfare
  playFanfare(audioContext) {
    // Create oscillator for main notes
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'triangle';
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.3;
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Get current time
    const now = audioContext.currentTime;
    
    // Create a short fanfare sequence
    const notes = [
      { note: 'C5', time: 0, duration: 0.15 },
      { note: 'E5', time: 0.15, duration: 0.15 },
      { note: 'G5', time: 0.3, duration: 0.2 },
      { note: 'C6', time: 0.5, duration: 0.5 }
    ];
    
    // Define frequency map
    const frequencyMap = {
      'C5': 523.25,
      'E5': 659.25,
      'G5': 783.99,
      'C6': 1046.50
    };
    
    // Schedule the notes
    notes.forEach(noteObj => {
      oscillator.frequency.setValueAtTime(frequencyMap[noteObj.note], now + noteObj.time);
      gainNode.gain.setValueAtTime(0.3, now + noteObj.time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + noteObj.time + noteObj.duration);
    });
    
    // Start and stop the oscillator
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  }

  disconnectedCallback() {
    console.log("AIGamePage disconnected - cleaning up resources");
    
    // Clean up event listeners when the component is removed
    if (this.checkCanvasInterval) {
      clearInterval(this.checkCanvasInterval);
      this.checkCanvasInterval = null;
    }
    
    // Clean up confetti interval if it exists
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
      this.confettiInterval = null;
    }
    
    // Properly clean up the game state and event listeners
    if (typeof window.cleanupAIPongGame === 'function') {
      window.cleanupAIPongGame();
    }
    
    // Clean up global variables that might persist between sessions
    window.gameCanvas = null;
    window.gameContext = null;
    window.player1ScoreElement = null;
    window.player2ScoreElement = null;
    window.startButton = null;
    window.resetButton = null;
    window.gameStatus = null;
    window.victoryOverlay = null;
    window.finalScore = null;
    window.victoryMessage = null;
    window.confettiContainer = null;
    window.gameTime = null;
    window.hitCount = null;
    window.difficultyDisplay = null;
    window.resetGame = null;
    window.gameRunning = false;
    window.gamePaused = false;
    
    // Remove event listeners from buttons to prevent memory leaks
    const backButton = this.shadow.getElementById('backButton');
    if (backButton) {
      backButton.replaceWith(backButton.cloneNode(true));
    }

    const rematchButton = this.shadow.getElementById('rematch-button');
    if (rematchButton) {
      rematchButton.replaceWith(rematchButton.cloneNode(true));
    }
    
    const backHomeButton = this.shadow.getElementById('back-home-button');
    if (backHomeButton) {
      backHomeButton.replaceWith(backHomeButton.cloneNode(true));
    }
    
    // Remove any script tags created by this component
    const scripts = document.querySelectorAll('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.textContent && script.textContent.includes('// Basic AI Pong Game Implementation')) {
        script.remove();
        console.log('Removed AI Pong game script');
        break;
      }
    }
  }

  setupEventListeners() {
    // Back button navigation
    const backButton = this.shadow.getElementById('backButton');
    if (backButton) {
      console.log("Setting up AI game Back button event listener");
      backButton.addEventListener('click', (e) => {
        console.log("AI game Back button clicked");
        e.preventDefault();
        
        // Clean up game resources before navigating away
        if (typeof window.cleanupAIPongGame === 'function') {
          window.cleanupAIPongGame();
        }
        
        // Force removal of the game scripts first
        const scripts = document.querySelectorAll('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts[i];
          if (script.textContent && script.textContent.includes('// Basic AI Pong Game Implementation')) {
            script.remove();
            console.log('Removed AI Pong game script');
            break;
          }
        }
        
        // Use a small timeout to ensure cleanup is complete before navigation
        setTimeout(() => {
          console.log("Dispatching navigation event to /selectgamemode");
          window.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { value: '/selectgamemode' }
          }));
        }, 50);
      });
    } else {
      console.error("AI game Back button element not found!");
    }

    // Victory overlay event listeners
    const rematchButton = this.shadow.getElementById('rematch-button');
    const backHomeButton = this.shadow.getElementById('back-home-button');
    
    if (rematchButton) {
      rematchButton.addEventListener('click', () => {
        const victoryOverlay = this.shadow.getElementById('victory-overlay');
        victoryOverlay.classList.remove('active');
        
        // Clean up existing game state before resetting
        if (typeof window.cleanupAIPongGame === 'function') {
          window.cleanupAIPongGame();
        }
        
        // Important: Delay before resetting to avoid infinite recursion
        setTimeout(() => {
          if (typeof window.resetGame === 'function') {
            window.resetGame();
          }
        }, 300);
      });
    }
    
    if (backHomeButton) {
      backHomeButton.addEventListener('click', (e) => {
        console.log("AI game Back Home button clicked");
        e.preventDefault();
        
        // Clean up game resources before navigating away
        if (typeof window.cleanupAIPongGame === 'function') {
          window.cleanupAIPongGame();
        }
        
        // Force removal of the game scripts first
        const scripts = document.querySelectorAll('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts[i];
          if (script.textContent && script.textContent.includes('// Basic AI Pong Game Implementation')) {
            script.remove();
            console.log('Removed AI Pong game script');
            break;
          }
        }
        
        // Use a small timeout to ensure cleanup is complete
        setTimeout(() => {
          console.log("Dispatching navigation event to /selectgamemode");
          window.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { value: '/selectgamemode' }
          }));
          
          // Additional direct navigation backup method
          try {
            const router = document.querySelector('router-component');
            if (router && typeof router.navigate === 'function') {
              router.navigate('/selectgamemode');
              console.log("Used direct router navigation");
            }
          } catch (err) {
            console.error("Router backup navigation failed:", err);
          }
        }, 50);
      });
    } else {
      console.error("AI game Back Home button element not found!");
    }
  }

  setupDifficultyPanel() {
    const settingsIcon = this.shadow.getElementById('settings-icon');
    const difficultyPanel = this.shadow.getElementById('difficulty-panel');
    const settingsOverlay = this.shadow.getElementById('settings-overlay');
    const closePanel = this.shadow.querySelector('.close-panel');
    const currentDifficultyElement = this.shadow.getElementById('current-difficulty');
    const difficultyOptions = this.shadow.querySelectorAll('.difficulty-option');
    
    // Set up the header settings icon with the AI Settings button functionality
    if (settingsIcon) {
      // Make the settings icon more visible and interactive
      settingsIcon.style.cursor = 'pointer';
      
      // Function to handle difficulty changes with a game-like UI
      const openDifficultyOptions = () => {
        // Create a full-screen game-like overlay
        const gameOverlay = document.createElement('div');
        gameOverlay.className = 'game-overlay';
        gameOverlay.style.position = 'fixed';
        gameOverlay.style.top = '0';
        gameOverlay.style.left = '0';
        gameOverlay.style.right = '0';
        gameOverlay.style.bottom = '0';
        gameOverlay.style.background = 'radial-gradient(circle at center, rgba(10, 15, 30, 0.85) 0%, rgba(5, 10, 20, 0.95) 100%)';
        gameOverlay.style.backdropFilter = 'blur(10px)';
        gameOverlay.style.WebkitBackdropFilter = 'blur(10px)';
        gameOverlay.style.zIndex = '999';
        gameOverlay.style.opacity = '0';
        gameOverlay.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        gameOverlay.style.display = 'flex';
        gameOverlay.style.justifyContent = 'center';
        gameOverlay.style.alignItems = 'center';
        gameOverlay.style.padding = '20px';
        
        // Create a futuristic control panel (keeping the same size)
        const controlPanel = document.createElement('div');
        controlPanel.className = 'difficulty-control-panel';
        controlPanel.style.width = '700px';
        controlPanel.style.maxWidth = '90%';
        controlPanel.style.background = 'linear-gradient(165deg, rgba(25, 35, 60, 0.9), rgba(15, 20, 40, 0.95))';
        controlPanel.style.borderRadius = '16px';
        controlPanel.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(135, 205, 234, 0.5)';
        controlPanel.style.overflow = 'hidden';
        controlPanel.style.position = 'relative';
        controlPanel.style.opacity = '0';
        controlPanel.style.transform = 'scale(0.95)';
        controlPanel.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        controlPanel.style.border = '1px solid rgba(135, 205, 234, 0.3)';
        controlPanel.style.minHeight = '420px';
        
        // Add keyframe animation for text effects
        const styleSheet = document.createElement('style');
        styleSheet.innerHTML = `
            @keyframes pulseBrightness {
                0% { filter: brightness(1); }
                100% { filter: brightness(1.3); }
            }
        `;
        document.head.appendChild(styleSheet);

        // Add animated backdrop pattern
        const backdrop = document.createElement('div');
        backdrop.style.position = 'absolute';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.right = '0';
        backdrop.style.bottom = '0';
        backdrop.style.background = 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23135379\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")';
        backdrop.style.backgroundSize = '130px 130px';
        backdrop.style.opacity = '0.3';
        backdrop.style.animation = 'moveBg 120s linear infinite';
        controlPanel.appendChild(backdrop);

        // Create inner content wrapper with balanced padding
        const contentWrapper = document.createElement('div');
        contentWrapper.style.position = 'relative';
        contentWrapper.style.zIndex = '2';
        contentWrapper.style.padding = '30px';
        contentWrapper.style.display = 'flex';
        contentWrapper.style.flexDirection = 'column';
        contentWrapper.style.alignItems = 'center';
        contentWrapper.style.justifyContent = 'space-between';
        contentWrapper.style.height = '100%';
        contentWrapper.style.boxSizing = 'border-box';
        controlPanel.appendChild(contentWrapper);
        
        // Create a futuristic header with holographic title
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.flexDirection = 'column';
        header.style.alignItems = 'center';
        header.style.marginBottom = '30px';
        header.style.position = 'relative';
        
        const titleDecoTop = document.createElement('div');
        titleDecoTop.style.width = '120px';
        titleDecoTop.style.height = '3px';
        titleDecoTop.style.background = 'linear-gradient(90deg, rgba(0, 150, 255, 0), rgba(0, 150, 255, 0.8), rgba(0, 150, 255, 0))';
        titleDecoTop.style.borderRadius = '3px';
        titleDecoTop.style.marginBottom = '15px';
        titleDecoTop.style.boxShadow = '0 0 15px rgba(0, 150, 255, 0.5)';
        header.appendChild(titleDecoTop);
        
        // Create a more compact title
        const mainTitle = document.createElement('div');
        mainTitle.style.position = 'relative';
        mainTitle.style.display = 'flex';
        mainTitle.style.flexDirection = 'column';
        mainTitle.style.alignItems = 'center';
        header.appendChild(mainTitle);
        
        const titleContent = document.createElement('div');
        titleContent.innerHTML = 'SELECT DIFFICULTY';
        titleContent.style.fontSize = '1.8em';
        titleContent.style.fontWeight = '700';
        titleContent.style.textTransform = 'uppercase';
        titleContent.style.letterSpacing = '2px';
        titleContent.style.color = '#fff';
        titleContent.style.textShadow = '0 0 15px rgba(0, 150, 255, 0.7), 0 0 30px rgba(0, 150, 255, 0.4)';
        titleContent.style.position = 'relative';
        titleContent.style.zIndex = '2';
        mainTitle.appendChild(titleContent);
        
        // Create subtitle
        const subtitle = document.createElement('div');
        subtitle.textContent = 'Choose your opponent\'s level';
        subtitle.style.color = 'rgba(135, 205, 234, 0.7)';
        subtitle.style.fontSize = '1em';
        subtitle.style.fontWeight = '300';
        subtitle.style.marginTop = '10px';
        subtitle.style.letterSpacing = '1px';
        mainTitle.appendChild(subtitle);
        
        const titleDecoBottom = document.createElement('div');
        titleDecoBottom.style.width = '70px';
        titleDecoBottom.style.height = '3px';
        titleDecoBottom.style.background = 'linear-gradient(90deg, rgba(0, 150, 255, 0), rgba(0, 150, 255, 0.6), rgba(0, 150, 255, 0))';
        titleDecoBottom.style.borderRadius = '3px';
        titleDecoBottom.style.marginTop = '15px';
        titleDecoBottom.style.boxShadow = '0 0 15px rgba(0, 150, 255, 0.5)';
        header.appendChild(titleDecoBottom);
        
        // Create a sci-fi close button
        const closeBtn = document.createElement('div');
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.width = '40px';
        closeBtn.style.height = '40px';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '10';
        closeBtn.style.transition = 'all 0.3s ease';
        
        const closeBtnBg = document.createElement('div');
        closeBtnBg.style.position = 'absolute';
        closeBtnBg.style.top = '0';
        closeBtnBg.style.left = '0';
        closeBtnBg.style.right = '0';
        closeBtnBg.style.bottom = '0';
        closeBtnBg.style.borderRadius = '50%';
        closeBtnBg.style.border = '2px solid rgba(135, 205, 234, 0.5)';
        closeBtnBg.style.transition = 'all 0.3s ease';
        closeBtnBg.style.opacity = '0.7';
        closeBtn.appendChild(closeBtnBg);
        
        const closeBtnIcon = document.createElement('div');
        closeBtnIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="rgba(135, 205, 234, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="rgba(135, 205, 234, 0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        closeBtnIcon.style.position = 'relative';
        closeBtnIcon.style.zIndex = '1';
        closeBtnIcon.style.transition = 'all 0.3s ease';
        closeBtn.appendChild(closeBtnIcon);
        
        closeBtn.addEventListener('mouseover', () => {
          closeBtnBg.style.transform = 'scale(1.1)';
          closeBtnBg.style.boxShadow = '0 0 15px rgba(135, 205, 234, 0.7)';
          closeBtnBg.style.borderColor = 'rgba(135, 205, 234, 0.9)';
          closeBtnBg.style.opacity = '1';
        });
        
        closeBtn.addEventListener('mouseout', () => {
          closeBtnBg.style.transform = 'scale(1)';
          closeBtnBg.style.boxShadow = 'none';
          closeBtnBg.style.borderColor = 'rgba(135, 205, 234, 0.5)';
          closeBtnBg.style.opacity = '0.7';
        });
        
        closeBtn.addEventListener('click', () => {
          // Animate out
          gameOverlay.style.opacity = '0';
          controlPanel.style.opacity = '0';
          controlPanel.style.transform = 'scale(0.95)';
          
          // Remove after animation completes
          setTimeout(() => {
            if (document.body.contains(gameOverlay)) {
              document.body.removeChild(gameOverlay);
            }
            if (gameOverlay.contains(controlPanel)) {
              gameOverlay.removeChild(controlPanel);
            }
          }, 500);
        });
        
        contentWrapper.appendChild(header);
        contentWrapper.appendChild(closeBtn);
        
        // Create difficulty options with more advanced properties
        const difficulties = [
          { 
            name: 'EASY', 
            value: 'easy', 
            description: 'For casual players and beginners',
            aiDetails: 'AI moves at 70% speed with predictable patterns',
            aiSpeed: 'AI Speed: 70%',
            color: '#4cd964',
            hoverColor: '#3cad50',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4cd964" stroke-width="2"/>
                  </svg>`,
            bgColor: 'rgba(76, 217, 100, 0.1)',
            borderColor: 'rgba(76, 217, 100, 0.3)'
          },
          { 
            name: 'MEDIUM', 
            value: 'medium', 
            description: 'For players with some experience',
            aiDetails: 'AI moves at 85% speed with varied reactions',
            aiSpeed: 'AI Speed: 85%',
            color: '#007aff',
            hoverColor: '#0062cc',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#007aff" stroke-width="2"/>
                    <path d="M12 2V22" stroke="#007aff" stroke-width="1" stroke-dasharray="2 2"/>
                    <path d="M2 12H22" stroke="#007aff" stroke-width="1" stroke-dasharray="2 2"/>
                  </svg>`,
            bgColor: 'rgba(0, 122, 255, 0.1)',
            borderColor: 'rgba(0, 122, 255, 0.3)'
          },
          { 
            name: 'HARD', 
            value: 'hard', 
            description: 'For skilled players seeking a challenge',
            aiDetails: 'AI moves at 100% speed with quick reactions',
            aiSpeed: 'AI Speed: 100%',
            color: '#ff3b30',
            hoverColor: '#d93129',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff3b30" stroke-width="2"/>
                    <path d="M12 16L12 17" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 7L12.01 13" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>`,
            bgColor: 'rgba(255, 59, 48, 0.1)',
            borderColor: 'rgba(255, 59, 48, 0.3)'
          }
        ];
        
        // No need for top spacer - removing
        
        // Create flexible spacer to push cards to middle
        const flexSpacer = document.createElement('div');
        flexSpacer.style.flexGrow = '0.7';
        flexSpacer.style.minHeight = '30px';
        contentWrapper.appendChild(flexSpacer);
        
        // Create difficulty options container with improved spacing
        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.justifyContent = 'center';
        optionsContainer.style.gap = '15px';
        optionsContainer.style.marginBottom = '20px';
        contentWrapper.appendChild(optionsContainer);
        
        // Add another flexible spacer to push current difficulty to bottom
        const bottomSpacer = document.createElement('div');
        bottomSpacer.style.flexGrow = '0.7';
        bottomSpacer.style.minHeight = '30px';
        contentWrapper.appendChild(bottomSpacer);
        
        // Add current difficulty display at the very bottom with enhanced styling
        const currentDiffDisplay = document.createElement('div');
        currentDiffDisplay.style.width = '100%';
        currentDiffDisplay.style.display = 'flex';
        currentDiffDisplay.style.flexDirection = 'column';
        currentDiffDisplay.style.alignItems = 'center';
        currentDiffDisplay.style.justifyContent = 'center';
        currentDiffDisplay.style.padding = '15px 0 12px';
        currentDiffDisplay.style.borderTop = '1px solid rgba(135, 205, 234, 0.3)';
        currentDiffDisplay.style.marginTop = 'auto';
        currentDiffDisplay.style.background = 'linear-gradient(to top, rgba(0, 120, 215, 0.05), transparent 80%)';
        currentDiffDisplay.style.boxShadow = 'inset 0 15px 10px -15px rgba(0, 0, 0, 0.2)';
        
        const currentLabel = document.createElement('div');
        currentLabel.textContent = 'CURRENT SETTING';
        currentLabel.style.color = 'rgba(255, 255, 255, 0.7)';
        currentLabel.style.fontSize = '0.8em';
        currentLabel.style.fontWeight = '600';
        currentLabel.style.letterSpacing = '1.5px';
        currentLabel.style.marginBottom = '5px';
        currentLabel.style.textTransform = 'uppercase';
        currentLabel.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        currentDiffDisplay.appendChild(currentLabel);
        
        // Add decorative line
        const decorLine = document.createElement('div');
        decorLine.style.width = '40px';
        decorLine.style.height = '2px';
        decorLine.style.background = 'linear-gradient(to right, transparent, rgba(135, 205, 234, 0.5), transparent)';
        decorLine.style.margin = '2px 0 8px';
        currentDiffDisplay.appendChild(decorLine);
        
        // Find the matching difficulty to get the color
        const currentDiffText = currentDifficultyElement.textContent.toLowerCase();
        const matchingDiff = difficulties.find(d => d.value === currentDiffText) || {
          color: '#007aff',
          hoverColor: '#0062cc',
          icon: difficulties[1].icon // Default to medium icon if not found
        };
        
        // Create a badge-like container for the current difficulty
        const currentValueContainer = document.createElement('div');
        currentValueContainer.style.display = 'flex';
        currentValueContainer.style.alignItems = 'center';
        currentValueContainer.style.justifyContent = 'center';
        currentValueContainer.style.gap = '8px';
        currentValueContainer.style.padding = '5px 12px';
        currentValueContainer.style.borderRadius = '5px';
        currentValueContainer.style.background = `rgba(${hexToRgb(matchingDiff.color)}, 0.1)`;
        currentValueContainer.style.border = `1px solid rgba(${hexToRgb(matchingDiff.color)}, 0.3)`;
        currentValueContainer.style.boxShadow = `0 2px 10px rgba(${hexToRgb(matchingDiff.color)}, 0.15)`;
        
        // Add icon from the matching difficulty
        const currentIcon = document.createElement('div');
        currentIcon.innerHTML = matchingDiff.icon;
        currentIcon.style.transform = 'scale(0.8)';
        currentValueContainer.appendChild(currentIcon);
        
        // Add text value with enhanced styling
        const currentValue = document.createElement('div');
        currentValue.textContent = currentDifficultyElement.textContent.toUpperCase();
        currentValue.style.background = `linear-gradient(to bottom, ${matchingDiff.color}, ${matchingDiff.hoverColor})`;
        currentValue.style.WebkitBackgroundClip = 'text';
        currentValue.style.WebkitTextFillColor = 'transparent';
        currentValue.style.fontSize = '1.2em';
        currentValue.style.fontWeight = '700';
        currentValue.style.letterSpacing = '1px';
        currentValue.style.textShadow = `0 2px 8px rgba(${hexToRgb(matchingDiff.color)}, 0.4)`;
        currentValueContainer.appendChild(currentValue);
        
        currentDiffDisplay.appendChild(currentValueContainer);
        
        // Create difficulty cards with a modern gaming aesthetic
        difficulties.forEach(diff => {
          // Create a more structured card-like option element
          const option = document.createElement('div');
          option.className = 'difficulty-card';
          option.style.flex = '0 0 auto';
          option.style.width = '160px';
          option.style.height = '280px'; // Increased height for better spacing
          option.style.display = 'flex';
          option.style.flexDirection = 'column';
          option.style.alignItems = 'center';
          option.style.padding = '15px';
          option.style.background = diff.bgColor || 'rgba(30, 35, 50, 0.5)';
          option.style.borderRadius = '12px';
          option.style.cursor = 'pointer';
          option.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
          option.style.position = 'relative';
          option.style.overflow = 'hidden';
          option.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          option.style.border = `1px solid ${diff.borderColor || 'rgba(120, 140, 180, 0.1)'}`;
          option.style.justifyContent = 'space-between'; // Distribute content evenly
          
          // Create header section (fixed height)
          const headerSection = document.createElement('div');
          headerSection.style.display = 'flex';
          headerSection.style.flexDirection = 'column';
          headerSection.style.alignItems = 'center';
          headerSection.style.width = '100%';
          headerSection.style.height = '70px'; // Fixed height for header section
          
          // Create top badge/icon
          const diffIcon = document.createElement('div');
          diffIcon.innerHTML = diff.icon;
          diffIcon.style.marginBottom = '8px';
          diffIcon.style.transform = 'scale(1.2)';
          headerSection.appendChild(diffIcon);
          
          // Create difficulty name with enhanced styling
          const diffName = document.createElement('div');
          diffName.textContent = diff.name;
          diffName.style.position = 'relative';
          diffName.style.color = diff.color;
          diffName.style.background = `linear-gradient(to bottom, ${diff.color}, ${diff.hoverColor})`;
          diffName.style.WebkitBackgroundClip = 'text';
          diffName.style.WebkitTextFillColor = 'transparent';
          diffName.style.fontSize = '1.2em';
          diffName.style.fontWeight = '800';
          diffName.style.letterSpacing = '1.5px';
          diffName.style.textShadow = `0 0 10px rgba(${hexToRgb(diff.color)}, 0.6)`;
          diffName.style.textTransform = 'uppercase';
          diffName.style.marginBottom = '5px';
          
          // Add subtle glow animation
          diffName.style.animation = 'pulseBrightness 3s infinite alternate';
          headerSection.appendChild(diffName);
          
          // Add a subtle underline
          const nameUnderline = document.createElement('div');
          nameUnderline.style.position = 'absolute';
          nameUnderline.style.bottom = '-3px';
          nameUnderline.style.left = '50%';
          nameUnderline.style.transform = 'translateX(-50%)';
          nameUnderline.style.width = '80%';
          nameUnderline.style.height = '2px';
          nameUnderline.style.background = `linear-gradient(to right, transparent, ${diff.color}, transparent)`;
          diffName.appendChild(nameUnderline);
          
          option.appendChild(headerSection);
          
          // Middle section for description (fixed height)
          const middleSection = document.createElement('div');
          middleSection.style.display = 'flex';
          middleSection.style.flexDirection = 'column';
          middleSection.style.alignItems = 'center';
          middleSection.style.justifyContent = 'center';
          middleSection.style.width = '100%';
          middleSection.style.height = '80px'; // Fixed height for description
          middleSection.style.margin = '15px 0';
          
          // Add separator line at the top of middle section
          const separator = document.createElement('div');
          separator.style.width = '30px';
          separator.style.height = '2px';
          separator.style.backgroundColor = diff.color;
          separator.style.opacity = '0.5';
          separator.style.marginBottom = '15px';
          middleSection.appendChild(separator);
          
          // Add description with enhanced styling
          const description = document.createElement('div');
          description.textContent = diff.description;
          description.style.color = 'rgba(255, 255, 255, 0.9)';
          description.style.textAlign = 'center';
          description.style.fontSize = '0.85em';
          description.style.fontWeight = '400';
          description.style.lineHeight = '1.35';
          description.style.padding = '0 8px';
          description.style.display = 'flex';
          description.style.alignItems = 'center';
          description.style.justifyContent = 'center';
          description.style.height = '45px';
          description.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
          middleSection.appendChild(description);
          
          option.appendChild(middleSection);
          
          // Bottom section for speed and button (fixed height)
          const bottomSection = document.createElement('div');
          bottomSection.style.display = 'flex';
          bottomSection.style.flexDirection = 'column';
          bottomSection.style.alignItems = 'center';
          bottomSection.style.width = '100%';
          bottomSection.style.height = '100px'; // Fixed height for bottom content
          
          // Add AI details with clean formatting
          const aiDetails = document.createElement('div');
          aiDetails.textContent = diff.aiSpeed || diff.aiDetails.split(' with')[0];
          aiDetails.style.color = `rgba(${hexToRgb(diff.color)}, 0.85)`;
          aiDetails.style.backgroundColor = `rgba(${hexToRgb(diff.color)}, 0.1)`;
          aiDetails.style.borderRadius = '3px';
          aiDetails.style.padding = '4px 10px';
          aiDetails.style.display = 'inline-block';
          aiDetails.style.textAlign = 'center';
          aiDetails.style.fontSize = '0.8em';
          aiDetails.style.fontWeight = '500';
          aiDetails.style.fontFamily = 'sans-serif';
          aiDetails.style.marginBottom = '20px';
          aiDetails.style.border = `1px solid rgba(${hexToRgb(diff.color)}, 0.2)`;
          bottomSection.appendChild(aiDetails);
          
          // Add select button with enhanced styling
          const selectBtn = document.createElement('div');
          selectBtn.textContent = 'SELECT';
          selectBtn.style.padding = '7px 14px';
          selectBtn.style.background = `linear-gradient(135deg, ${diff.color}, ${diff.hoverColor})`;
          selectBtn.style.color = '#fff';
          selectBtn.style.borderRadius = '4px';
          selectBtn.style.fontSize = '0.75em';
          selectBtn.style.fontWeight = '700';
          selectBtn.style.letterSpacing = '1.5px';
          selectBtn.style.boxShadow = `0 2px 10px rgba(${hexToRgb(diff.color)}, 0.4)`;
          selectBtn.style.transition = 'all 0.3s ease';
          selectBtn.style.border = `1px solid rgba(${hexToRgb(diff.color)}, 0.5)`;
          selectBtn.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
          bottomSection.appendChild(selectBtn);
          
          option.appendChild(bottomSection);
          
          // Add a glowing border for current selection
          if (diff.value === currentDifficultyElement.textContent.toLowerCase()) {
            option.style.boxShadow = `0 0 30px rgba(${hexToRgb(diff.color)}, 0.4)`;
            option.style.border = `2px solid ${diff.color}`;
            option.style.transform = 'translateY(-10px)';
          }
          
          // Enhanced hover effects
          option.addEventListener('mouseover', () => {
            option.style.backgroundColor = `rgba(${hexToRgb(diff.color)}, 0.15)`;
            option.style.transform = 'translateX(8px)';
            option.style.boxShadow = `0 5px 15px rgba(${hexToRgb(diff.color)}, 0.2)`;
            option.style.borderLeft = `4px solid ${diff.color}`;
            optionLabel.style.color = diff.color;
            optionDesc.style.color = '#fff';
            colorDot.style.textShadow = `0 0 10px ${diff.color}`;
          });
          
          option.addEventListener('mouseout', () => {
            if (diff.value !== currentDifficultyElement.textContent.toLowerCase()) {
              option.style.backgroundColor = 'rgba(48, 54, 95, 0.3)';
              option.style.transform = 'translateX(0)';
              option.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
              option.style.borderLeft = '4px solid transparent';
              optionLabel.style.color = '#fff';
              optionDesc.style.color = '#8a8fa3';
              colorDot.style.textShadow = `0 0 5px ${diff.color}`;
            }
          });
          

          
          // Click handler
          option.addEventListener('click', () => {
            console.log(`Selected difficulty: ${diff.name}`);
            currentDifficultyElement.textContent = diff.name;
            
            // Update the radio buttons in the main panel
            const radioInput = this.shadow.querySelector(`#${diff.value}-radio`);
            if (radioInput) {
              this.shadow.querySelectorAll('input[name="difficulty"]').forEach(input => {
                input.checked = false;
              });
              radioInput.checked = true;
            }
            
            // Update game difficulty if it's running
            if (typeof window.setAIDifficulty === 'function') {
              window.setAIDifficulty(diff.value);
            }
            
            // Animate out
            blurOverlay.style.opacity = '0';
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            // Remove after animation completes
            setTimeout(() => {
              if (document.body.contains(blurOverlay)) {
                document.body.removeChild(blurOverlay);
              }
              if (document.body.contains(dropdown)) {
                document.body.removeChild(dropdown);
              }
            }, 300);
          });
          
          // Add click and hover effects for the option
          option.addEventListener('mouseover', () => {
            if (diff.value !== currentDifficultyElement.textContent.toLowerCase()) {
              option.style.transform = 'translateY(-5px)';
              option.style.boxShadow = `0 10px 25px rgba(${hexToRgb(diff.color)}, 0.3)`;
              selectBtn.style.boxShadow = `0 0 20px rgba(${hexToRgb(diff.color)}, 0.5)`;
              selectBtn.style.transform = 'scale(1.05)';
            }
          });
          
          option.addEventListener('mouseout', () => {
            if (diff.value !== currentDifficultyElement.textContent.toLowerCase()) {
              option.style.transform = 'translateY(0)';
              option.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
              selectBtn.style.boxShadow = `0 0 15px rgba(${hexToRgb(diff.color)}, 0.3)`;
              selectBtn.style.transform = 'scale(1)';
            }
          });
          
          // Store value for selection handling
          option.dataset.value = diff.value;
          
          // Add click handlers to both the card and the select button
          const handleDifficultySelection = () => {
            console.log(`Selected difficulty: ${diff.name}`);
            
            // Update the UI display
            currentDifficultyElement.textContent = diff.name;
            currentValue.textContent = diff.name;
            
            // Update the radio buttons in the main panel
            const radioInput = this.shadow.querySelector(`#${diff.value}-radio`);
            if (radioInput) {
              this.shadow.querySelectorAll('input[name="difficulty"]').forEach(input => {
                input.checked = false;
              });
              radioInput.checked = true;
            }
            
            // Update game difficulty if it's running
            if (typeof window.setAIDifficulty === 'function') {
              window.setAIDifficulty(diff.value);
            }
            
            // Update selection visually
            difficulties.forEach(d => {
              const otherCard = optionsContainer.querySelector(`.difficulty-card[data-value="${d.value}"]`);
              if (otherCard) {
                if (d.value === diff.value) {
                  otherCard.style.boxShadow = `0 0 30px rgba(${hexToRgb(d.color)}, 0.4)`;
                  otherCard.style.border = `2px solid ${d.color}`;
                  otherCard.style.transform = 'translateY(-10px)';
                } else {
                  otherCard.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                  otherCard.style.border = `1px solid ${d.borderColor || 'rgba(120, 140, 180, 0.1)'}`;
                  otherCard.style.transform = 'translateY(0)';
                }
              }
            });
            
            // Visual feedback animation
            const feedbackOverlay = document.createElement('div');
            feedbackOverlay.style.position = 'absolute';
            feedbackOverlay.style.top = '0';
            feedbackOverlay.style.left = '0';
            feedbackOverlay.style.right = '0';
            feedbackOverlay.style.bottom = '0';
            feedbackOverlay.style.backgroundColor = `rgba(${hexToRgb(diff.color)}, 0.2)`;
            feedbackOverlay.style.borderRadius = '15px';
            feedbackOverlay.style.opacity = '0';
            feedbackOverlay.style.transition = 'opacity 0.3s ease';
            option.appendChild(feedbackOverlay);
            
            setTimeout(() => {
              feedbackOverlay.style.opacity = '1';
              setTimeout(() => {
                feedbackOverlay.style.opacity = '0';
                setTimeout(() => {
                  if (option.contains(feedbackOverlay)) {
                    option.removeChild(feedbackOverlay);
                  }
                }, 300);
              }, 300);
            }, 0);
            
            // Close panel after brief delay to allow visual confirmation
            setTimeout(() => {
              // Animate out
              gameOverlay.style.opacity = '0';
              controlPanel.style.opacity = '0';
              controlPanel.style.transform = 'scale(0.95)';
              
              // Remove after animation completes
              setTimeout(() => {
                if (document.body.contains(gameOverlay)) {
                  document.body.removeChild(gameOverlay);
                }
              }, 500);
            }, 1000);
          };
          
          option.addEventListener('click', handleDifficultySelection);
          selectBtn.addEventListener('click', handleDifficultySelection);
          
          optionsContainer.appendChild(option);
        });
        
        // Add current difficulty display to the panel
        contentWrapper.appendChild(currentDiffDisplay);
        
        // Add the control panel to the overlay
        gameOverlay.appendChild(controlPanel);
        
        // Add overlay to the document
        document.body.appendChild(gameOverlay);
        
        // Animate in with staggered timing
        setTimeout(() => {
          gameOverlay.style.opacity = '1';
          
          setTimeout(() => {
            controlPanel.style.opacity = '1';
            controlPanel.style.transform = 'scale(1)';
            
            // Animate in each card with staggered delay
            const cards = optionsContainer.querySelectorAll('.difficulty-card');
            cards.forEach((card, index) => {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              card.style.transition = 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
              
              setTimeout(() => {
                card.style.opacity = '1';
                if (card.dataset.value === currentDifficultyElement.textContent.toLowerCase()) {
                  card.style.transform = 'translateY(-10px)';
                } else {
                  card.style.transform = 'translateY(0)';
                }
              }, 100 + (index * 150));
            });
          }, 200);
        }, 10);
        
        // Add keydown event listener to close with Escape key
        const keyDownHandler = (e) => {
          if (e.key === 'Escape') {
            // Animate out
            gameOverlay.style.opacity = '0';
            controlPanel.style.opacity = '0';
            controlPanel.style.transform = 'scale(0.95)';
            
            // Remove after animation completes
            setTimeout(() => {
              if (document.body.contains(gameOverlay)) {
                document.body.removeChild(gameOverlay);
              }
              document.removeEventListener('keydown', keyDownHandler);
            }, 500);
          }
        };
        document.addEventListener('keydown', keyDownHandler);
        
        // Add a click handler to the overlay to close the panel
        gameOverlay.addEventListener('click', (e) => {
          if (e.target === gameOverlay) {
            // Animate out
            gameOverlay.style.opacity = '0';
            controlPanel.style.opacity = '0';
            controlPanel.style.transform = 'scale(0.95)';
            
            // Remove after animation completes
            setTimeout(() => {
              if (document.body.contains(gameOverlay)) {
                document.body.removeChild(gameOverlay);
              }
              document.removeEventListener('keydown', keyDownHandler);
            }, 500);
          }
        });
        
        // Add animation keyframes for the pattern background
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes moveBg {
            from { background-position: 0 0; }
            to { background-position: 100% 100%; }
          }
        `;
        document.head.appendChild(styleElement);
        
        // Log for debugging
        console.log(`Created difficulty selection with ${difficulties.length} options`);
        
        // Add a click handler to the overlay to close the dropdown
        blurOverlay.addEventListener('click', (e) => {
          if (e.target === blurOverlay) {
            // Animate out
            blurOverlay.style.opacity = '0';
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            // Remove after animation completes
            setTimeout(() => {
              if (document.body.contains(blurOverlay)) {
                document.body.removeChild(blurOverlay);
              }
              if (document.body.contains(dropdown)) {
                document.body.removeChild(dropdown);
              }
              document.removeEventListener('keydown', keyDownHandler);
            }, 300);
          }
        });
        
        // Log for debugging
        console.log(`Created difficulty dropdown with ${difficulties.length} options`);
        console.log('Options container children:', optionsContainer.childNodes.length);
        
        // Animate in
        setTimeout(() => {
          blurOverlay.style.opacity = '1';
          dropdown.style.opacity = '1';
          dropdown.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
          if (!dropdown.contains(e.target) && e.target !== settingsIcon) {
            // Animate out
            blurOverlay.style.opacity = '0';
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            // Remove after animation completes
            setTimeout(() => {
              if (document.body.contains(blurOverlay)) {
                document.body.removeChild(blurOverlay);
              }
              if (document.body.contains(dropdown)) {
                document.body.removeChild(dropdown);
              }
            }, 300);
            
            document.removeEventListener('click', closeDropdown);
          }
        };
        
        // Use setTimeout to avoid immediate triggering
        setTimeout(() => {
          document.addEventListener('click', closeDropdown);
        }, 0);
        
        // Helper function to convert hex to rgb
        function hexToRgb(hex) {
          // Remove the hash if it exists
          hex = hex.replace(/^#/, '');
          
          // Parse the hex values
          let bigint = parseInt(hex, 16);
          let r = (bigint >> 16) & 255;
          let g = (bigint >> 8) & 255;
          let b = bigint & 255;
          
          return r + ',' + g + ',' + b;
        }
      };
      
      // Add click event to the settings icon
      settingsIcon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Settings icon clicked - showing difficulty options');
        // First, make sure any existing dropdowns are removed
        const existingDropdowns = document.querySelectorAll('.custom-dropdown');
        const existingOverlays = document.querySelectorAll('.blur-overlay');
        
        existingDropdowns.forEach(dropdown => {
          if (dropdown.parentNode) {
            dropdown.parentNode.removeChild(dropdown);
          }
        });
        
        existingOverlays.forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });
        
        // Now open the new dropdown
        openDifficultyOptions();
      });
      
      // Also make the current difficulty text clickable
      if (currentDifficultyElement) {
        currentDifficultyElement.style.cursor = 'pointer';
        currentDifficultyElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Current difficulty clicked - showing difficulty options');
          // First, make sure any existing dropdowns are removed
          const existingDropdowns = document.querySelectorAll('.custom-dropdown');
          const existingOverlays = document.querySelectorAll('.blur-overlay');
          
          existingDropdowns.forEach(dropdown => {
            if (dropdown.parentNode) {
              dropdown.parentNode.removeChild(dropdown);
            }
          });
          
          existingOverlays.forEach(overlay => {
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          });
          
          // Now open the new dropdown
          openDifficultyOptions();
        });
      }
    }
    
    // We'll use the custom dropdown exclusively instead of the panel
    // Hide the original difficulty panel as we won't be using it
    if (difficultyPanel) {
      difficultyPanel.style.display = 'none';
    }
    
    // Close panel when overlay or X is clicked
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        difficultyPanel.classList.remove('active');
        settingsOverlay.classList.remove('active');
      });
    }
    
    if (closePanel) {
      closePanel.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        difficultyPanel.classList.remove('active');
        settingsOverlay.classList.remove('active');
      });
    }
    
    // Set initial difficulty (Medium by default)
    const mediumOption = this.shadow.getElementById('medium-btn');
    if (mediumOption) {
      const mediumRadio = mediumOption.querySelector('input[type="radio"]');
      if (mediumRadio) {
        mediumRadio.checked = true;
      }
    }
    
    // Make the current difficulty text more visible
    if (currentDifficultyElement) {
      currentDifficultyElement.style.position = 'relative';
      currentDifficultyElement.style.zIndex = '2';
    }
    
    // Handle difficulty selection
    if (difficultyOptions) {
      difficultyOptions.forEach(option => {
        option.addEventListener('click', () => {
          const difficultyValue = option.getAttribute('data-difficulty');
          const radioInput = option.querySelector('input[type="radio"]');
          
          // Update radio buttons
          this.shadow.querySelectorAll('input[name="difficulty"]').forEach(input => {
            input.checked = false;
          });
          
          if (radioInput) {
            radioInput.checked = true;
          }
          
          // Update current difficulty text
          if (currentDifficultyElement) {
            currentDifficultyElement.textContent = difficultyValue.charAt(0).toUpperCase() + difficultyValue.slice(1);
          }
          
          // Close the panel after selection
          difficultyPanel.classList.remove('active');
          settingsOverlay.classList.remove('active');
          
          // Update game difficulty if it's running
          if (typeof window.setAIDifficulty === 'function') {
            window.setAIDifficulty(difficultyValue);
          }
        });
      });
    }
  }

  initGame() {
    const component = this;
    
    // Clear any existing interval
    if (component.checkCanvasInterval) {
      clearInterval(component.checkCanvasInterval);
    }
    
    // Detect when our canvas is fully loaded in the DOM
    component.checkCanvasInterval = setInterval(() => {
      const canvas = component.shadow.getElementById('gameCanvas');
      if (canvas) {
        console.log('Canvas found, initializing game...');
        clearInterval(component.checkCanvasInterval);
        component.checkCanvasInterval = null;
        
        // Force canvas redraw to ensure it's properly rendered
        const width = canvas.width;
        const height = canvas.height;
        canvas.width = 10; // Force redraw
        canvas.width = width; 
        canvas.height = height;
        
        // Draw a test rectangle to confirm canvas is working
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 50, 50);
        
        // Make canvas globally accessible
        window.gameCanvas = canvas;
        window.gameContext = ctx; // Store context globally too
        
        // Add required canvas dimensions if not present
        if (!canvas.width || !canvas.height) {
          console.log('Canvas has no dimensions, setting default size');
          canvas.width = 800;
          canvas.height = 500;
        }
        
        console.log('Canvas dimensions:', canvas.width, canvas.height);
        
        // Expose the difficulty settings
        component.setupGameElements();
        
        // Skip external script loading attempts and go straight to inline implementation
        console.log('Using inline script implementation...');
        component.loadScriptInline();
      }
    }, 100);
  }
  
  loadScriptInline() {
    // As a last resort, try to manually embed the code
    console.log('Attempting inline script loading as fallback...');
    
    // Create an inline script with the AI Pong functionality
    const script = document.createElement('script');
    script.textContent = `
      // Basic AI Pong Game Implementation
      (function() {
        // Game variables
        let canvas, ctx;
        let ballX = 400, ballY = 250;
        let ballSpeedX = 5, ballSpeedY = 5;
        let player1Y = 250, player2Y = 250;
        let player1Score = 0, player2Score = 0;
        let hitCount = 0;
        let gameStartTime = 0;
        let gameTimeElapsed = 0;
        let gameRunning = false;
        let gamePaused = false;
        let gameLoopId = null;
        let lastMouseY = 0; // Store the last valid mouse Y position
        let scoringCooldown = false; // Add scoring cooldown flag
        let eventListenersAttached = false; // Track if event listeners are attached
        let gameTimeInterval = null;
        
        // AI difficulty settings
        let aiSpeed = 5; // Default medium difficulty
        let currentDifficulty = 'medium';
        
        // Constants
        const PADDLE_HEIGHT = 100;
        const PADDLE_WIDTH = 10;
        const BALL_RADIUS = 10;
        const WINNING_SCORE = 5;
        
        // Create dedicated function to clean up resources
        window.cleanupAIPongGame = function() {
          console.log('Cleaning up AI Pong game resources');
          
          // Cancel any active game loop
          if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
          }
          
          // Clear game time tracker
          if (gameTimeInterval) {
            clearInterval(gameTimeInterval);
            gameTimeInterval = null;
          }
          
          // Reset game state
          gameRunning = false;
          gamePaused = false;
          
          // Remove event listeners if attached
          if (eventListenersAttached) {
            if (canvas) {
              canvas.removeEventListener('mousemove', updatePlayerPosition);
            }
            document.removeEventListener('mousemove', documentMouseMove);
            document.removeEventListener('keydown', handleKeyPress);
            eventListenersAttached = false;
          }
          
          // Remove button event listeners
          if (window.startButton) {
            window.startButton.removeEventListener('click', startGame);
          }
          
          if (window.resetButton) {
            window.resetButton.removeEventListener('click', resetGame);
          }
          
          // Reset scores to prevent them from persisting
          player1Score = 0;
          player2Score = 0;
          hitCount = 0;
          
          console.log('AI Pong game cleanup complete');
        };
        
        // Initialize once DOM is loaded
        window.resetGame = function() {
          console.log('Game reset called');
          
          // Get canvas from global variable set by the component
          canvas = window.gameCanvas;
          if (!canvas) {
            console.error('Canvas element not found');
            return;
          }
          
          // Use the pre-stored context
          ctx = window.gameContext;
          if (!ctx) {
            console.error('Canvas context not found, trying to create it');
            ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('Failed to create canvas context');
              return;
            }
          }
          
          // Clear any existing game loop first
          if (gameLoopId) {
            console.log('Cancelling existing game loop');
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
          }
          
          // Remove any existing event listeners to prevent duplicates
          if (eventListenersAttached) {
            canvas.removeEventListener('mousemove', updatePlayerPosition);
            document.removeEventListener('mousemove', documentMouseMove);
            document.removeEventListener('keydown', handleKeyPress);
            eventListenersAttached = false;
          }
          
          // Make sure canvas has proper dimensions
          if (!canvas.width || !canvas.height) {
            console.log('Canvas has no dimensions, setting default size');
            canvas.width = 800;
            canvas.height = 500;
          }
          
          // Reset game state
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
          ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
          player1Y = canvas.height / 2 - PADDLE_HEIGHT / 2;
          player2Y = canvas.height / 2 - PADDLE_HEIGHT / 2;
          player1Score = 0;
          player2Score = 0;
          hitCount = 0;
          gameRunning = false;
          gamePaused = false;
          scoringCooldown = false;
          
          // Add mouse move event listeners to both canvas and document if not already attached
          if (!eventListenersAttached) {
            canvas.addEventListener('mousemove', updatePlayerPosition);
            document.addEventListener('mousemove', documentMouseMove);
            document.addEventListener('keydown', handleKeyPress);
            eventListenersAttached = true;
          }
          
          // Remove existing button listeners
          if (window.startButton) {
            window.startButton.removeEventListener('click', startGame);
          }
          
          if (window.resetButton) {
            window.resetButton.removeEventListener('click', resetGame);
          }
          
          // Set up button event listeners
          if (window.startButton) {
            console.log('Setting up start button event listener');
            window.startButton.addEventListener('click', startGame);
          } else {
            console.error('Start button not found');
          }
          
          if (window.resetButton) {
            console.log('Setting up reset button event listener');
            window.resetButton.addEventListener('click', resetGame);
          } else {
            console.error('Reset button not found');
          }
          
          // Set up difficulty buttons
          setupDifficultyButtons();
          
          // Draw initial state
          drawEverything();
          updateScoreDisplay();
          
          // Display game instructions
          if (window.gameStatus) {
            window.gameStatus.textContent = "Press SPACE to start/pause";
          }
          
          // Ensure victory overlay is hidden
          if (window.victoryOverlay) {
            window.victoryOverlay.classList.remove('active');
          }
        };
        
        // Handle keyboard input
        function handleKeyPress(event) {
          // Space bar to toggle game state (start/pause/resume)
          if (event.code === 'Space') {
            event.preventDefault(); // Prevent scrolling
            
            if (!gameRunning) {
              // Start the game if not running
              startGame();
            } else {
              // Toggle pause if already running
              togglePause();
            }
            return;
          }
          
          // P key as alternative to toggle pause
          if (event.code === 'KeyP') {
            event.preventDefault();
            togglePause();
            return;
          }
        }
        
        // Toggle pause state
        function togglePause() {
          if (!gameRunning) {
            // If game is not running, start it
            startGame();
            return;
          }
          
          gamePaused = !gamePaused;
          
          if (gamePaused) {
            // Pause the game
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Paused - Press SPACE or P to resume";
            }
          } else {
            // Resume the game
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Running - Press SPACE or P to pause";
            }
            gameLoop();
          }
        }
        
        // Direct canvas mouse movement handler
        function updatePlayerPosition(event) {
          if (!canvas) return;
          
          const rect = canvas.getBoundingClientRect();
          const mouseY = event.clientY - rect.top;
          
          updatePaddlePosition(mouseY);
        }
        
        // Separate paddle position update function
        function updatePaddlePosition(mouseY) {
          // Ensure mouseY is within canvas boundaries
          if (mouseY >= 0 && mouseY <= canvas.height) {
            // Center the paddle on the mouse position
            player1Y = mouseY - PADDLE_HEIGHT / 2;
            
            // Keep paddle on screen
            if (player1Y < 0) player1Y = 0;
            if (player1Y > canvas.height - PADDLE_HEIGHT) player1Y = canvas.height - PADDLE_HEIGHT;
            
            // Force a redraw if game is not running
            if (!gameRunning) {
              drawEverything();
            }
          }
        }

        // Track mouse movement across the entire document
        function documentMouseMove(event) {
          const canvasRect = canvas.getBoundingClientRect();
          
          // Check if the mouse is within the horizontal bounds of the canvas
          if (event.clientX >= canvasRect.left && event.clientX <= canvasRect.right) {
            // Calculate the vertical position relative to the canvas
            const mouseY = event.clientY - canvasRect.top;
            
            // Update last known mouse position if it's within canvas vertical bounds
            if (mouseY >= 0 && mouseY <= canvasRect.height) {
              lastMouseY = mouseY;
              updatePaddlePosition(mouseY);
            } else if (event.clientY < canvasRect.top) {
              // Mouse above canvas - move paddle to top
              updatePaddlePosition(0);
            } else if (event.clientY > canvasRect.bottom) {
              // Mouse below canvas - move paddle to bottom
              updatePaddlePosition(canvasRect.height);
            }
          }
        }
        
        function setupDifficultyButtons() {
          // Set up difficulty buttons if they exist
          if (window.easyBtn) {
            window.easyBtn.addEventListener('click', () => setDifficulty('easy'));
          }
          if (window.mediumBtn) {
            window.mediumBtn.addEventListener('click', () => setDifficulty('medium'));
          }
          if (window.hardBtn) {
            window.hardBtn.addEventListener('click', () => setDifficulty('hard'));
          }
          if (window.settingsIcon) {
            window.settingsIcon.addEventListener('click', toggleDifficultyPanel);
          }
        }
        
        function setDifficulty(level) {
          currentDifficulty = level;
          
          switch(level) {
            case 'easy':
              aiSpeed = 3;
              break;
            case 'medium':
              aiSpeed = 5;
              break;
            case 'hard':
              aiSpeed = 7;
              break;
          }
          
          if (window.difficultyPanel) {
            window.difficultyPanel.classList.remove('active');
          }
          
          if (window.currentDifficulty) {
            window.currentDifficulty.textContent = level.charAt(0).toUpperCase() + level.slice(1);
          }
        }
        
        function toggleDifficultyPanel() {
          if (window.difficultyPanel) {
            window.difficultyPanel.classList.toggle('active');
          }
        }
        
        function startGame() {
          if (!gameRunning) {
            // Start the game
            gameRunning = true;
            gamePaused = false;
            
            // Reset hit count at start of new game
            hitCount = 0;
            
            // Start tracking game time
            gameStartTime = Date.now();
            if (gameTimeInterval) {
              clearInterval(gameTimeInterval);
            }
            
            gameTimeInterval = setInterval(() => {
              if (gameRunning && !gamePaused) {
                gameTimeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                const minutes = Math.floor(gameTimeElapsed / 60).toString().padStart(2, '0');
                const seconds = (gameTimeElapsed % 60).toString().padStart(2, '0');
                const timeString = \`\${minutes}:\${seconds}\`;
                
                // Update game time element in the victory overlay if it exists
                if (window.gameTime) {
                  window.gameTime.textContent = timeString;
                }
              }
            }, 1000);
            
            // Update the game status to "playing"
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Running - Press SPACE or P to pause";
            }
            
            gameLoop();
          } else if (gamePaused) {
            // Resume the game
            gamePaused = false;
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Resumed - Press SPACE or P to pause";
            }
            gameLoop();
          }
        }
        
        function resetGame() {
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
          ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
          player1Score = 0;
          player2Score = 0;
          
          // Reset stats
          hitCount = 0;
          gameTimeElapsed = 0;
          
          updateScoreDisplay(null);
          
          if (!gameRunning) {
            drawEverything();
          }
        }
        
        function updateScoreDisplay(scorer) {
          if (window.player1ScoreElement) {
            window.player1ScoreElement.textContent = player1Score;
            if (scorer === 'player') {
              // Animate player score
              window.player1ScoreElement.classList.remove('score-animation');
              // Trigger reflow to restart animation
              void window.player1ScoreElement.offsetWidth;
              window.player1ScoreElement.classList.add('score-animation');
              
              // Create goal flash effect
              createGoalFlash();
            }
          }
          if (window.player2ScoreElement) {
            window.player2ScoreElement.textContent = player2Score;
            if (scorer === 'ai') {
              // Animate AI score
              window.player2ScoreElement.classList.remove('score-animation');
              // Trigger reflow to restart animation
              void window.player2ScoreElement.offsetWidth;
              window.player2ScoreElement.classList.add('score-animation');
              
              // Create goal flash effect
              createGoalFlash();
            }
          }
        }
        
        function createGoalFlash() {
          // Find the score-board element
          const scoreBoard = document.querySelector('.score-board');
          if (!scoreBoard) return;
          
          // Create and append flash element to the score-board
          const flashElement = document.createElement('div');
          flashElement.classList.add('score-container-flash');
          scoreBoard.style.position = 'relative'; // Ensure position context
          scoreBoard.appendChild(flashElement);
          
          // Remove the element after animation completes
          setTimeout(() => {
            if (flashElement.parentNode) {
              flashElement.parentNode.removeChild(flashElement);
            }
          }, 600);
        }
        
        function moveAI() {
          const aiCenterY = player2Y + PADDLE_HEIGHT / 2;
          const ballCenterY = ballY;
          
          // Only move AI if ball is moving toward AI side
          if (ballSpeedX > 0) {
            if (aiCenterY < ballCenterY - 35) {
              player2Y += aiSpeed;
            } else if (aiCenterY > ballCenterY + 35) {
              player2Y -= aiSpeed;
            }
          }
          
          // Keep paddle on screen
          if (player2Y < 0) player2Y = 0;
          if (player2Y > canvas.height - PADDLE_HEIGHT) player2Y = canvas.height - PADDLE_HEIGHT;
        }
        
        function moveBall() {
          // Update ball position
          ballX += ballSpeedX;
          ballY += ballSpeedY;
          
          // Check for collisions with walls
          if (ballY < BALL_RADIUS || ballY > canvas.height - BALL_RADIUS) {
            ballSpeedY = -ballSpeedY;
          }
          
          // Check for collisions with paddles
          // Player's paddle (left)
          if (ballSpeedX < 0 && ballX <= 30 + PADDLE_WIDTH && ballX >= 30 && 
              ballY > player1Y && ballY < player1Y + PADDLE_HEIGHT) {
            
            // Ball has hit the player's paddle
            ballSpeedX = -ballSpeedX;
            
            // Increase hit count for statistics
            hitCount++;
            
            // Adjust the angle based on where the ball hit the paddle
            const paddleCenter = player1Y + PADDLE_HEIGHT / 2;
            const hitPosition = ballY - paddleCenter;
            ballSpeedY = hitPosition * 0.2;
          }
          
          // AI's paddle (right)
          if (ballSpeedX > 0 && ballX >= canvas.width - 30 - PADDLE_WIDTH && ballX <= canvas.width - 30 && 
              ballY > player2Y && ballY < player2Y + PADDLE_HEIGHT) {
            
            // Ball has hit the AI's paddle
            ballSpeedX = -ballSpeedX;
            
            // Increase hit count for statistics
            hitCount++;
            
            // Adjust the angle based on where the ball hit the paddle
            const paddleCenter = player2Y + PADDLE_HEIGHT / 2;
            const hitPosition = ballY - paddleCenter;
            ballSpeedY = hitPosition * 0.2;
          }
          
          // Check if the ball is out of bounds (score)
          if (!scoringCooldown) {
            // Ball went past left edge (Player 2/AI scores)
            if (ballX < 0) {
              console.log("AI scored!");
              scoringCooldown = true;
              updateScore('player2');
            }
            
            // Ball went past right edge (Player 1 scores)
            if (ballX > canvas.width) {
              console.log("Player scored!");
              scoringCooldown = true;
              updateScore('player1');
            }
          }
        }
        
        function updateScore(player) {
          // Update the appropriate score
          if (player === 'player1') {
            player1Score++;
            console.log("Player 1 scores! Current score:", player1Score, "-", player2Score);
            updateScoreDisplay('player1');
          } else {
            player2Score++;
            console.log("Player 2 (AI) scores! Current score:", player1Score, "-", player2Score);
            updateScoreDisplay('player2');
          }
          
          // Reset ball position
          resetBall();
          
          // Check for a winner
          checkWinner();
        }
        
        function resetBall() {
          // Reset ball to center
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          
          // Randomize the ball direction
          ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
          ballSpeedY = (Math.random() > 0.5 ? 3 : -3);
          
          // Add a slight delay before the ball starts moving
          ballSpeedX = 0;
          ballSpeedY = 0;
          
          setTimeout(() => {
            if (gameRunning && !gamePaused) {
              ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
              ballSpeedY = (Math.random() > 0.5 ? 3 : -3);
              scoringCooldown = false;
            }
          }, 1000);
        }
        
        function updateScoreDisplay(scorer) {
          // Update player 1 score
          if (window.player1ScoreElement) {
            window.player1ScoreElement.textContent = player1Score;
            if (scorer === 'player1') {
              // Add animation class if player 1 scored
              window.player1ScoreElement.classList.remove('score-animation');
              void window.player1ScoreElement.offsetWidth; // Trigger reflow
              window.player1ScoreElement.classList.add('score-animation');
            }
          }
          
          // Update player 2/AI score
          if (window.player2ScoreElement) {
            window.player2ScoreElement.textContent = player2Score;
            if (scorer === 'player2') {
              // Add animation class if player 2/AI scored
              window.player2ScoreElement.classList.remove('score-animation');
              void window.player2ScoreElement.offsetWidth; // Trigger reflow
              window.player2ScoreElement.classList.add('score-animation');
            }
          }
        }
        
        function checkWinner() {
          // Log current scores for debugging
          console.log("Checking winner - scores:", player1Score, player2Score, "Winning score:", WINNING_SCORE);
          
          if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
            console.log("Game over! Showing victory screen.");
            
            // Game is over
            gameRunning = false;
            
            // Cancel any active game loop
            if (gameLoopId) {
              cancelAnimationFrame(gameLoopId);
              gameLoopId = null;
            }
            
            // Stop game time tracking
            if (gameTimeInterval) {
              clearInterval(gameTimeInterval);
              gameTimeInterval = null;
            }
            
            // Update game status
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Over - Rematch or return home";
            }
            
            // Make sure the victory overlay exists
            if (!window.victoryOverlay) {
              console.error("Victory overlay element not found!");
              return;
            }
            
            console.log("Showing victory overlay");
            
            // Show victory screen with enhanced animations and effects
            // Determine the winner and update title
            const playerWon = player1Score > player2Score;
            console.log("Player won:", playerWon);
            
            if (window.victoryTitle) {
              window.victoryTitle.textContent = playerWon ? "Victory!" : "Defeat!";
              window.victoryTitle.setAttribute('data-text', playerWon ? "Victory!" : "Defeat!");
              
              if (!playerWon) {
                // If AI won, change the title color
                window.victoryTitle.style.color = "#ff7777";
                window.victoryTitle.style.textShadow = "0 0 15px rgba(255, 50, 50, 0.7)";
              }
            }
            
            // Update the victory message
            if (window.victoryMessage) {
              if (playerWon) {
                window.victoryMessage.innerHTML = \`Congratulations! <i class="fas fa-medal"></i> <i class="fas fa-star"></i>\`;
              } else {
                window.victoryMessage.innerHTML = \`Better luck next time! <i class="fas fa-sync"></i>\`;
              }
            }
            
            // Update the final score
            if (window.finalScore) {
              window.finalScore.textContent = \`\${player1Score} - \${player2Score}\`;
              window.finalScore.classList.add(playerWon ? 'player-won' : 'player-lost');
            }
            
            // Update the difficulty display
            if (window.difficultyDisplay) {
              window.difficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
            }
            
            // Update the hit count
            if (window.hitCount) {
              window.hitCount.textContent = hitCount;
            }
            
            // Update the game time
            if (window.gameTime) {
              const minutes = Math.floor(gameTimeElapsed / 60).toString().padStart(2, '0');
              const seconds = (gameTimeElapsed % 60).toString().padStart(2, '0');
              window.gameTime.textContent = \`\${minutes}:\${seconds}\`;
            }
            
            // Show the victory overlay with animation
            window.victoryOverlay.classList.add('active');
            console.log("Victory overlay class added:", window.victoryOverlay.className);
          }
        }
        
        function createConfetti() {
          if (!window.confettiContainer) return;
          
          window.confettiContainer.innerHTML = '';
          
          for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.backgroundColor = getRandomColor();
            window.confettiContainer.appendChild(confetti);
          }
        }
        
        function getRandomColor() {
          const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
          return colors[Math.floor(Math.random() * colors.length)];
        }
        
        function drawEverything() {
          if (!ctx) {
            console.error('Cannot draw: context is null');
            return;
          }
          
          // Clear canvas with black background
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw center line
          ctx.strokeStyle = '#fff';
          ctx.setLineDash([10, 15]);
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, 0);
          ctx.lineTo(canvas.width / 2, canvas.height);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw paddles with enhanced design
          
          // Left paddle (player) - blue gradient with segments
          drawAdvancedPaddle(
            ctx,
            20,
            player1Y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            '#00BFFF',  // Deep Sky Blue
            '#1E90FF',  // Dodger Blue
            '#00FFFF',  // Cyan highlight
            '#0000CD'   // Medium Blue accent
          );
          
          // Right paddle (AI) - red gradient with segments
          drawAdvancedPaddle(
            ctx,
            canvas.width - 20 - PADDLE_WIDTH,
            player2Y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            '#FF4500',  // Orange Red
            '#8B0000',  // Dark Red
            '#FFA500',  // Orange highlight
            '#FF0000'   // Red accent
          );
          
          // Draw ball - white glow effect
          ctx.beginPath();
          ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          
          // Add glow effect to ball
          ctx.beginPath();
          ctx.arc(ballX, ballY, BALL_RADIUS + 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Helper function to draw rounded rectangles
        function drawRoundedRect(context, x, y, width, height, radius) {
          context.beginPath();
          context.moveTo(x + radius, y);
          context.lineTo(x + width - radius, y);
          context.quadraticCurveTo(x + width, y, x + width, y + radius);
          context.lineTo(x + width, y + height - radius);
          context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          context.lineTo(x + radius, y + height);
          context.quadraticCurveTo(x, y + height, x, y + height - radius);
          context.lineTo(x, y + radius);
          context.quadraticCurveTo(x, y, x + radius, y);
          context.closePath();
          context.fill();
        }
        
        // Advanced paddle drawing with segments and glow effects
        function drawAdvancedPaddle(context, x, y, width, height, colorStart, colorEnd, highlightColor, accentColor) {
          // Set a larger border radius for more rounded paddles
          const cornerRadius = 15; // Increased from 5 to 15
          
          // Create gradient for the main paddle
          const gradient = context.createLinearGradient(x, 0, x + width, 0);
          gradient.addColorStop(0, colorStart);
          gradient.addColorStop(1, colorEnd);
          context.fillStyle = gradient;
          
          // Draw the main paddle shape with increased radius
          drawRoundedRect(context, x, y, width, height, cornerRadius);
          
          // Add outer glow/highlight with matching rounded corners
          context.strokeStyle = highlightColor;
          context.lineWidth = 2;
          // Use the same rounded rectangle function for the stroke to match the fill
          context.save();
          context.beginPath();
          drawRoundedRectPath(context, x, y, width, height, cornerRadius);
          context.stroke();
          context.restore();
          
          // Add segments to the paddle (horizontal lines)
          context.beginPath();
          const segments = 5;
          const segmentHeight = height / segments;
          
          // Make segments respect the rounded corners
          const insetAmount = cornerRadius / 2;
          
          for (let i = 1; i < segments; i++) {
            context.moveTo(x + insetAmount, y + i * segmentHeight);
            context.lineTo(x + width - insetAmount, y + i * segmentHeight);
          }
          
          context.strokeStyle = accentColor;
          context.lineWidth = 1;
          context.stroke();
          
          // Add a grip pattern on the side
          context.beginPath();
          const gripDots = 8;
          const gripSpacing = height / (gripDots + 1);
          
          for (let i = 1; i <= gripDots; i++) {
            // Slightly move the grip dots inward
            context.rect(x + width - 4, y + i * gripSpacing, 2, 2);
          }
          
          context.fillStyle = highlightColor;
          context.fill();
          
          // Add a subtle inner glow with rounded corners
          context.shadowColor = highlightColor;
          context.shadowBlur = 10;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.strokeStyle = 'rgba(255,255,255,0.3)';
          context.lineWidth = 1;
          
          // Use rounded corners for the inner glow as well
          context.beginPath();
          drawRoundedRectPath(context, x + 2, y + 2, width - 4, height - 4, cornerRadius - 2);
          context.stroke();
          
          // Reset shadow
          context.shadowColor = 'transparent';
          context.shadowBlur = 0;
        }
        
        // Helper function to create rounded rectangle path without filling
        function drawRoundedRectPath(context, x, y, width, height, radius) {
          context.moveTo(x + radius, y);
          context.lineTo(x + width - radius, y);
          context.quadraticCurveTo(x + width, y, x + width, y + radius);
          context.lineTo(x + width, y + height - radius);
          context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          context.lineTo(x + radius, y + height);
          context.quadraticCurveTo(x, y + height, x, y + height - radius);
          context.lineTo(x, y + radius);
          context.quadraticCurveTo(x, y, x + radius, y);
          context.closePath();
        }
        
        function gameLoop() {
          if (!gameRunning || gamePaused) {
            console.log('Game not running or paused, stopping loop');
            return;
          }
          
          moveAI();
          moveBall();
          drawEverything();
          
          // Store the ID to be able to cancel it later
          gameLoopId = requestAnimationFrame(gameLoop);
        }
        
        // Immediately initialize the game
        if (window.gameCanvas && window.gameContext) {
          console.log('Canvas and context ready, initializing game immediately');
          window.resetGame();
        } else {
          console.error('Canvas or context not ready, game initialization will be delayed');
        }
      })();
    `;
    
    document.body.appendChild(script);
    console.log('Inline game script injected');
    
    // Double-check that the game is initialized after a short delay
    setTimeout(() => {
      if (typeof window.resetGame === 'function' && !window.gameRunning) {
        console.log('Ensuring game is initialized');
        window.resetGame();
      }
    }, 1000);
  }
  
  generateParticles() {
    const particlesContainer = this.shadow.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    // Create a random number of particles between 20-40
    const particleCount = Math.floor(Math.random() * 20) + 20;
    
    for (let i = 0; i < particleCount; i++) {
      // Create a particle element
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Randomize size (2-6px)
      const size = Math.floor(Math.random() * 4) + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Randomize position
      const xPos = Math.random() * 100;
      const yPos = Math.random() * 100;
      particle.style.left = `${xPos}%`;
      particle.style.top = `${yPos}%`;
      
      // Randomize animation duration and delay
      const duration = Math.random() * 10 + 5; // 5-15s
      const delay = Math.random() * 5;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      // Add particle to container
      particlesContainer.appendChild(particle);
    }
  }

  setupGameElements() {
    const component = this;
    
    // Expose shadow DOM elements to global scope for the game script to access
    window.player1ScoreElement = component.shadow.getElementById('player1-score');
    window.player2ScoreElement = component.shadow.getElementById('player2-score');
    window.startButton = component.shadow.getElementById('startButton');
    window.resetButton = component.shadow.getElementById('resetButton');
    window.gameStatus = component.shadow.getElementById('game-status');
    window.victoryOverlay = component.shadow.getElementById('victory-overlay');
    window.finalScore = component.shadow.getElementById('final-score');
    window.victoryMessage = component.shadow.querySelector('.victory-message');
    window.confettiContainer = component.shadow.querySelector('.confetti-container');
    window.gameTime = component.shadow.getElementById('game-time');
    window.hitCount = component.shadow.getElementById('hit-count');
    window.difficultyDisplay = component.shadow.getElementById('difficulty-display');
    window.victoryTitle = component.shadow.getElementById('victory-title');
    
    console.log("Game elements set up. Victory overlay:", window.victoryOverlay ? "Found" : "Not found");
  }

}

customElements.define('aigame-page', AIGamePage);
export default AIGamePage;