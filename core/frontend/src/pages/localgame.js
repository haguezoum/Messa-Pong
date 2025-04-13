let template = document.createElement("template");

template.innerHTML = 
  /*html*/
`<div class="game-container">
    <!-- Floating elements for background effect -->
    <div class="floating-elements">
      <div class="floating-element" style="--delay: 0.3s; --size: 26px; --top: 18%; --left: 5%; --seed: 1.4;"><i class="fas fa-gamepad"></i></div>
      <div class="floating-element" style="--delay: 1.8s; --size: 22px; --top: 30%; --left: 88%; --seed: 0.9;"><i class="fas fa-users"></i></div>
      <div class="floating-element" style="--delay: 0.5s; --size: 24px; --top: 75%; --left: 90%; --seed: 1.3;"><i class="fas fa-table-tennis"></i></div>
      <div class="floating-element" style="--delay: 2.5s; --size: 32px; --top: 85%; --left: 10%; --seed: 0.6;"><i class="fas fa-medal"></i></div>
      <div class="floating-element" style="--delay: 3.2s; --size: 20px; --top: 45%; --left: 45%; --seed: 1.7;"><i class="fas fa-star"></i></div>
    </div>
    
    <!-- Particles container -->
    <div class="particles-container"></div>
    <div class="game-header">
      <div class="game-title-container">
        <h1 class="game-title" data-text="META PONG">META PONG</h1>
        <div class="title-glow-effect"></div>
      </div>
      <div id="game-status">Press Start to Play</div>
    </div>

    <div class="score-board">
      <div class="score">
        <div class="player-label">P1</div>
        <div id="player1-score">0</div>
      </div>
      <div class="vs-badge">VS</div>
      <div class="score">
        <div class="player-label">P2</div>
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
</div>

<!-- Victory Overlay -->
<div id="victory-overlay">
  <div class="confetti-container"></div>
  <div class="victory-content">
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
    <h2 class="victory-title" data-text="Victory!">Victory!</h2>
    <p class="victory-message" id="victory-player">Congratulations!</p>
    <div id="final-score" class="victory-score">0 - 0</div>
    <div class="stat-container">
      <div class="match-stats">
        <div class="stat-item">
          <span class="stat-label"><i class="fas fa-clock"></i> Time</span>
          <span id="game-time" class="stat-value">00:00</span>
        </div>
        <div class="stat-item">
          <span class="stat-label"><i class="fas fa-medal"></i> Winner</span>
          <span id="winner-display" class="stat-value">Player 1</span>
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

class LocalGamePage extends HTMLElement {
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
    linkElem.setAttribute('href', 'src/assets/style/localgame-page.css');
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
    console.log("LocalGamePage is Connected");
    
    // Check if we're in tournament mode
    this.isTournamentMode = localStorage.getItem('tournamentMatchType') !== null;
    console.log("Tournament mode:", this.isTournamentMode);
    
    // Setup event listeners for buttons
    this.setupEventListeners();
    
    // Initialize the game
    this.initGame();
    
    // Apply title animation
    this.setupTitleAnimation();
    
    // Generate background particles
    this.generateParticles();
    
    // Setup confetti for victory screen
    this.setupConfetti();
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

  disconnectedCallback() {
    console.log("LocalGamePage disconnected - cleaning up resources");
    
    // Clear any existing canvas check interval
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
    if (typeof window.cleanupPongGame === 'function') {
      window.cleanupPongGame();
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
      if (script.textContent && script.textContent.includes('// Basic Local Pong Game Implementation')) {
        script.remove();
        console.log('Removed Pong game script');
        break;
      }
    }
  }

  setupEventListeners() {
    // Back button navigation
    const backButton = this.shadow.getElementById('backButton');
    if (backButton) {
      console.log("Setting up Back button event listener");
      backButton.addEventListener('click', (e) => {
        console.log("Back button clicked");
        e.preventDefault();
        
        // Clean up game resources before navigating away
        if (typeof window.cleanupPongGame === 'function') {
          window.cleanupPongGame();
        }
        
        // Force removal of the game scripts first
        const scripts = document.querySelectorAll('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts[i];
          if (script.textContent && script.textContent.includes('// Basic Local Pong Game Implementation')) {
            script.remove();
            console.log('Removed Pong game script');
            break;
          }
        }
        
        // Check if we need to return to tournament or game selection
        const returnToPath = this.isTournamentMode ? '/tournament' : '/selectgamemode';
        
        // Use a small timeout to ensure cleanup is complete before navigation
        setTimeout(() => {
          console.log(`Dispatching navigation event to ${returnToPath}`);
        window.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { value: returnToPath }
        }));
        }, 50);
      });
    } else {
      console.error("Back button element not found!");
    }

    // Victory overlay event listeners
    const rematchButton = this.shadow.getElementById('rematch-button');
    const backHomeButton = this.shadow.getElementById('back-home-button');
    
    if (rematchButton) {
      rematchButton.addEventListener('click', () => {
        const victoryOverlay = this.shadow.getElementById('victory-overlay');
        victoryOverlay.classList.remove('active');
        
        // Clean up existing game state before resetting
        if (typeof window.cleanupPongGame === 'function') {
          window.cleanupPongGame();
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
        console.log("Back Home button clicked");
        e.preventDefault();
        
        // Clean up game resources before navigating away
        if (typeof window.cleanupPongGame === 'function') {
          window.cleanupPongGame();
        }
        
        // Force removal of the game scripts first
        const scripts = document.querySelectorAll('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
          const script = scripts[i];
          if (script.textContent && script.textContent.includes('// Basic Local Pong Game Implementation')) {
            script.remove();
            console.log('Removed Pong game script');
            break;
          }
        }

        // Check if we need to return to tournament or game selection
        const returnToPath = this.isTournamentMode ? '/tournament' : '/selectgamemode';
        
        // If in tournament mode, save the winner before returning
        if (this.isTournamentMode && window.winnerDisplay) {
          const winner = window.winnerDisplay.textContent;
          localStorage.setItem('tournamentMatchWinner', winner);
          console.log('Saved tournament match winner:', winner);
        }
        
        // Use a small timeout to ensure cleanup is complete
        setTimeout(() => {
          console.log(`Dispatching navigation event to ${returnToPath}`);
        window.dispatchEvent(new CustomEvent('stateChanged', {
            detail: { value: returnToPath }
        }));
        }, 50);
      });
    } else {
      console.error("Back Home button element not found!");
    }
  }

  initGame() {
    // Create a new inline script that will handle the game initialization
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
        
        // Properly configure game elements
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
    
    // Create an inline script with the Local Pong functionality
    const script = document.createElement('script');
    script.textContent = `
      // Basic Local Pong Game Implementation
      (function() {
        // Game variables
        let canvas, ctx;
        let ballX = 400, ballY = 250;
        let ballSpeedX = 5, ballSpeedY = 5;
        let player1Y = 250, player2Y = 250;
        let player1Score = 0, player2Score = 0;
        let gameRunning = false;
        let gamePaused = false;
        let gameLoopId = null;
        let scoringCooldown = false; // Add scoring cooldown flag
        let keyListenersAttached = false; // Track if key listeners are attached
        let gameStartTime = 0;
        let gameTimeElapsed = 0;
        let gameTimeInterval = null;
        
        // Constants
        const PADDLE_HEIGHT = 100;
        const PADDLE_WIDTH = 10;
        const BALL_RADIUS = 10;
        const WINNING_SCORE = 5;
        const PADDLE_SPEED = 8; // Reduced for smoother movement applied each frame
        
        // Key states
        const keyState = {
          w: false,
          s: false,
          arrowUp: false,
          arrowDown: false
        };
        
        // Check if we're in tournament mode and change player names if needed
        const isTournamentMode = localStorage.getItem('tournamentMatchType') !== null;
        let player1Label = "Player 1";
        let player2Label = "Player 2";
        
        // Rename players for tournament mode if applicable
        if (isTournamentMode) {
          // Load the tournament data to get player names
          const tournamentState = localStorage.getItem('tournamentState');
          if (tournamentState) {
            try {
              const tournamentData = JSON.parse(tournamentState);
              if (tournamentData.currentPlayers && tournamentData.currentPlayers.length === 2) {
                player1Label = tournamentData.currentPlayers[0];
                player2Label = tournamentData.currentPlayers[1];
                
                // Update player labels in the UI
                const p1Label = document.querySelector('.shadow-root .player-label:first-child');
                const p2Label = document.querySelector('.shadow-root .player-label:last-child');
                
                if (p1Label) p1Label.textContent = player1Label;
                if (p2Label) p2Label.textContent = player2Label;
              }
            } catch (e) {
              console.error('Failed to parse tournament state:', e);
            }
          }
        }
        
        // Create dedicated function to clean up resources
        window.cleanupPongGame = function() {
          console.log('Cleaning up Pong game resources');
          
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
          
          // Remove event listeners
          if (keyListenersAttached) {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            keyListenersAttached = false;
          }
          
          // Remove button event listeners
          if (window.startButton) {
            window.startButton.removeEventListener('click', startGame);
          }
          
          if (window.resetButton) {
            window.resetButton.removeEventListener('click', window.resetGame);
          }
          
          // Reset scores to prevent them from persisting
          player1Score = 0;
          player2Score = 0;
          
          console.log('Pong game cleanup complete');
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
          
          // Remove any existing key event listeners to prevent duplicates
          if (keyListenersAttached) {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            keyListenersAttached = false;
          }
          
          // Make sure canvas has proper dimensions
          if (!canvas.width || !canvas.height) {
            console.log('Canvas has no dimensions, setting default size');
            canvas.width = 800;
            canvas.height = 500;
          }
          
          // Reset ball position and speed
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
          ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
          
          // Reset scores
          player1Score = 0;
          player2Score = 0;
          updateScoreDisplay(null);
          
          // Reset paddle positions
          player1Y = canvas.height / 2 - PADDLE_HEIGHT / 2;
          player2Y = canvas.height / 2 - PADDLE_HEIGHT / 2;
          
          // Reset game state
          gameRunning = false;
          gamePaused = false;
          scoringCooldown = false;
          
          // Reset key states
          keyState.w = false;
          keyState.s = false;
          keyState.arrowUp = false;
          keyState.arrowDown = false;
          
          // Setup key event listeners only if not already set up
          if (!keyListenersAttached) {
          document.addEventListener('keydown', handleKeyDown);
          document.addEventListener('keyup', handleKeyUp);
            keyListenersAttached = true;
          }
          
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
        
        function handleKeyDown(event) {
          // Space bar to toggle game state (start/pause/resume)
          if (event.code === 'Space') {
            event.preventDefault(); // Prevent page scrolling
            
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
          
          // Track key states for smooth movement
          switch(event.code) {
            case 'KeyW':
              keyState.w = true;
              break;
            case 'KeyS':
              keyState.s = true;
              break;
            case 'ArrowUp':
              keyState.arrowUp = true;
              break;
            case 'ArrowDown':
              keyState.arrowDown = true;
              break;
          }
        }
        
        // Add key up handler to stop paddle movement when keys are released
        function handleKeyUp(event) {
          switch(event.code) {
            case 'KeyW':
              keyState.w = false;
              break;
            case 'KeyS':
              keyState.s = false;
              break;
            case 'ArrowUp':
              keyState.arrowUp = false;
              break;
            case 'ArrowDown':
              keyState.arrowDown = false;
              break;
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
        
        function startGame() {
          if (!gameRunning) {
            console.log('Starting game loop');
            gameRunning = true;
            gamePaused = false;
            if (window.gameStatus) {
              window.gameStatus.textContent = "Game Running - Press SPACE or P to pause";
            }
            
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
            
            gameLoop();
          } else if (gamePaused) {
            // If game is paused, resume it
            togglePause();
          }
        }
        
        function updateScoreDisplay(scorer) {
          console.log("Updating score display:", player1Score, "-", player2Score);
          
          if (window.player1ScoreElement) {
            window.player1ScoreElement.textContent = player1Score;
            if (scorer === 'player1') {
              // Animate player1 score
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
            if (scorer === 'player2') {
              // Animate player2 score
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
        
        function movePlayers() {
          // Player 1 controls (W and S keys)
          if (keyState.w) {
            player1Y -= PADDLE_SPEED;
          }
          if (keyState.s) {
            player1Y += PADDLE_SPEED;
          }
          
          // Player 2 controls (Arrow keys)
          if (keyState.arrowUp) {
            player2Y -= PADDLE_SPEED;
          }
          if (keyState.arrowDown) {
            player2Y += PADDLE_SPEED;
          }
          
          // Keep paddles on screen
          if (player1Y < 0) player1Y = 0;
          if (player1Y > canvas.height - PADDLE_HEIGHT) player1Y = canvas.height - PADDLE_HEIGHT;
          if (player2Y < 0) player2Y = 0;
          if (player2Y > canvas.height - PADDLE_HEIGHT) player2Y = canvas.height - PADDLE_HEIGHT;
        }
        
        function moveBall() {
          // Store previous position for better collision detection
          const prevBallX = ballX;
          const prevBallY = ballY;
          
          // Update ball position
          ballX += ballSpeedX;
          ballY += ballSpeedY;
          
          // Top and bottom wall collision
          if (ballY < BALL_RADIUS || ballY > canvas.height - BALL_RADIUS) {
            ballSpeedY = -ballSpeedY;
            // Correct ball position to prevent getting stuck in the wall
            if (ballY < BALL_RADIUS) ballY = BALL_RADIUS;
            if (ballY > canvas.height - BALL_RADIUS) ballY = canvas.height - BALL_RADIUS;
          }
          
          // Adjust paddle collision detection to account for rounded corners
          const cornerRadius = 15; // Match the paddle corner radius
          
          // Left paddle collision with adjusted collision bounds
          if (ballSpeedX < 0 && 
              ballX <= 30 + PADDLE_WIDTH && 
              prevBallX > 30 + PADDLE_WIDTH && // Check if ball was outside paddle in previous frame
              ballY >= player1Y && 
              ballY <= player1Y + PADDLE_HEIGHT) {
            
            ballSpeedX = -ballSpeedX * 1.1; // Speed up slightly
            
            // Adjust angle based on where ball hits paddle
            const deltaY = ballY - (player1Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.2;
            
            // Correct ball position to prevent getting stuck in the paddle
            ballX = 30 + PADDLE_WIDTH + 1;
          }
          
          // Right paddle collision with adjusted collision bounds
          if (ballSpeedX > 0 && 
              ballX >= canvas.width - 30 - PADDLE_WIDTH && 
              prevBallX < canvas.width - 30 - PADDLE_WIDTH && // Check if ball was outside paddle in previous frame
              ballY >= player2Y && 
              ballY <= player2Y + PADDLE_HEIGHT) {
            
            ballSpeedX = -ballSpeedX * 1.1; // Speed up slightly
            
            // Adjust angle based on where ball hits paddle
            const deltaY = ballY - (player2Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.2;
            
            // Correct ball position to prevent getting stuck in the paddle
            ballX = canvas.width - 30 - PADDLE_WIDTH - 1;
          }
          
          // Process scoring - ensure we're looking for boundary crossings
          // Only count scores once when the ball fully crosses the boundary
          if (!scoringCooldown) {
            // Score points - ball fully goes past left edge (Player 2 scores)
            if (ballX < -BALL_RADIUS && prevBallX >= -BALL_RADIUS) {
              // Set cooldown to prevent multiple score counts
              scoringCooldown = true;
              player2Score++;
              console.log("Player 2 scores! Score is now", player1Score, "-", player2Score);
              updateScoreDisplay('player2');
              checkWinner();
              resetBall();
              return;
            }
            
            // Score points - ball fully goes past right edge (Player 1 scores)
            if (ballX > canvas.width + BALL_RADIUS && prevBallX <= canvas.width + BALL_RADIUS) {
              // Set cooldown to prevent multiple score counts
              scoringCooldown = true;
              player1Score++;
              console.log("Player 1 scores! Score is now", player1Score, "-", player2Score);
              updateScoreDisplay('player1');
              checkWinner();
              resetBall();
              return;
            }
          }
        }
        
        function resetBall() {
          // Reset ball to center
          ballX = canvas.width / 2;
          ballY = canvas.height / 2;
          
          // Add a slight delay before the ball starts moving again
          ballSpeedX = 0;
          ballSpeedY = 0;
          
          // Use setTimeout to give players a moment to prepare
          setTimeout(() => {
            if (gameRunning && !gamePaused) {
              // Set random direction but consistent initial speed
              ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
              ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
              
              // Reset scoring cooldown so we can score again
              scoringCooldown = false;
            }
          }, 1000);
          
          // Check for a winner after each score
          checkWinner();
        }
        
        function checkWinner() {
          // Check if either player has reached the winning score
          if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
            console.log("Checking winner - scores:", player1Score, player2Score, "Winning score:", WINNING_SCORE);
            // Stop the game
            cancelAnimationFrame(gameLoopId);
            gameRunning = false;
            
            // Stop the game timer
            if (gameTimeInterval) {
              clearInterval(gameTimeInterval);
            }
            
            // Calculate final time
            const endTime = Date.now();
            const totalGameTime = Math.floor((endTime - gameStartTime) / 1000);
            
            // Format game time
            const minutes = Math.floor(totalGameTime / 60);
            const seconds = totalGameTime % 60;
            const formattedTime = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
            
            // Update time in the victory overlay
            if (window.gameTime) {
              window.gameTime.textContent = formattedTime;
            }
            
            if (window.victoryOverlay) {
              // Update final score
              if (window.finalScore) {
                window.finalScore.textContent = \`\${player1Score} - \${player2Score}\`;
              }
              
              // Update winner display
              const winner = player1Score > player2Score ? player1Label : player2Label;
              if (window.winnerDisplay) {
                window.winnerDisplay.textContent = winner;
                window.winnerDisplay.className = "stat-value " + (player1Score > player2Score ? "player1-color" : "player2-color");
              }
              
              // Store winner for tournament mode
              if (isTournamentMode) {
                localStorage.setItem('tournamentMatchWinner', winner);
              }
              
              // Update victory message
              if (window.victoryPlayer) {
                window.victoryPlayer.innerHTML = \`\${winner} Wins! <i class="fas fa-medal"></i>\`;
              }
              
              // Hide game canvas and show victory overlay
              window.victoryOverlay.classList.add('active');
              console.log("Victory overlay class added:", window.victoryOverlay.className);
              
              // Call back to our component to play victory animation
              setTimeout(() => {
                if (window.componentInstance && typeof window.componentInstance.playVictoryAnimation === 'function') {
                  window.componentInstance.playVictoryAnimation();
                }
                
                if (window.componentInstance && typeof window.componentInstance.playVictorySound === 'function') {
                  window.componentInstance.playVictorySound();
                }
              }, 500);
            }
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
          
          // Left paddle (player 1) - blue gradient with segments
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
          
          // Right paddle (player 2) - green gradient with segments
          drawAdvancedPaddle(
            ctx,
            canvas.width - 20 - PADDLE_WIDTH,
            player2Y,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            '#32CD32',  // Lime Green
            '#006400',  // Dark Green
            '#7FFF00',  // Chartreuse highlight
            '#008000'   // Green accent
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
          
          // Update paddle positions based on key states
          movePlayers();
          
          // Update ball position and check for scoring
          moveBall();
          
          // Draw everything
          drawEverything();
          
          // Add FPS limiter to ensure consistent game speed
          // and prevent ball from moving too fast
          setTimeout(() => {
            // Store the ID to be able to cancel it later
            gameLoopId = requestAnimationFrame(gameLoop);
          }, 1000 / 60); // Target 60 FPS
        }
        
        // Immediately initialize the game
        if (window.gameCanvas && window.gameContext) {
          console.log('Canvas and context ready, initializing game immediately');
          window.resetGame();
          
          // Add event listeners for start and reset buttons
          if (window.startButton) {
            window.startButton.addEventListener('click', startGame);
          }
          
          if (window.resetButton) {
            window.resetButton.addEventListener('click', window.resetGame);
          }
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
    window.victoryPlayer = component.shadow.getElementById('victory-player');
    window.winnerDisplay = component.shadow.getElementById('winner-display');
    window.gameTime = component.shadow.getElementById('game-time');
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
      
      /* Player colors */
      .player1-color {
        color: #00BFFF;
        text-shadow: 0 0 10px rgba(0, 191, 255, 0.7);
      }
      
      .player2-color {
        color: #32CD32;
        text-shadow: 0 0 10px rgba(50, 205, 50, 0.7);
      }
    `;
    this.shadow.appendChild(victoryStyle);
  }
  
  // Play animations when victory screen shows
  playVictoryAnimation() {
    // Animate the victory title with a typing effect
    const victoryTitle = this.shadow.querySelector('.victory-title');
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
}

customElements.define('localgame-page', LocalGamePage);
export default LocalGamePage;