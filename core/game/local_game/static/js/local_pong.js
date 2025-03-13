// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 20;
const PADDLE_SPEED = 10;
const BALL_SPEED = 5;
const SPEED_INCREASE = 1.2; // Speed multiplier when ball hits paddle
const MAX_BALL_SPEED = 15; // Maximum ball speed
const WINNING_SCORE = 5;
const TRAIL_LENGTH = 5;  // Number of trail positions to remember
const HIT_EFFECT_DURATION = 200; // Duration of hit effect in milliseconds

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    // Get DOM elements
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element:', canvas);
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const gameStatus = document.getElementById('game-status');
    const player1ScoreElement = document.getElementById('player1-score');
    const player2ScoreElement = document.getElementById('player2-score');

    console.log('Game elements loaded:', {
        startButton,
        resetButton,
        gameStatus,
        player1ScoreElement,
        player2ScoreElement
    });

    // Game state
    let gameState = {
        player1Score: 0,
        player2Score: 0,
        player1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        player2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        player1Trail: [],
        player2Trail: [],
        player1HitEffect: 0,
        player2HitEffect: 0,
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT / 2,
        ballSpeedX: 0,
        ballSpeedY: 0,
        lastBallSpeedX: 0, // Store last ball speed for pause/resume
        lastBallSpeedY: 0, // Store last ball speed for pause/resume
        currentSpeedMultiplier: 1,
        isPaused: true,
        isGameOver: false,
        ballHitEffect: 0, // Track when ball hit effect should show
        ballHitX: 0,     // Store X position of hit
        ballHitY: 0      // Store Y position of hit
    };

    // Key states
    const keys = {
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false
    };

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    console.log('Canvas size set to:', canvas.width, canvas.height);

    function handleKeyDown(e) {
        if (e.key in keys) {
            keys[e.key] = true;
            e.preventDefault();
        }
        if (e.key === ' ' || e.code === 'Space') {
            togglePause();
            e.preventDefault();
        }
    }

    function handleKeyUp(e) {
        if (e.key in keys) {
            keys[e.key] = false;
        }
    }

    function togglePause() {
        console.log('Toggle pause called, isGameOver:', gameState.isGameOver);
        if (!gameState.isGameOver) {
            gameState.isPaused = !gameState.isPaused;
            console.log('Game paused state:', gameState.isPaused);
            
            if (!gameState.isPaused) {
                // Resuming the game
                if (gameState.lastBallSpeedX === 0 && gameState.lastBallSpeedY === 0) {
                    // Starting a new round
                    gameState.ballSpeedX = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
                    gameState.ballSpeedY = BALL_SPEED * (Math.random() * 2 - 1) * 0.5;
                } else {
                    // Resuming from pause - restore previous direction
                    gameState.ballSpeedX = gameState.lastBallSpeedX;
                    gameState.ballSpeedY = gameState.lastBallSpeedY;
                }
                console.log('Ball speed set to:', gameState.ballSpeedX, gameState.ballSpeedY);
                gameStatus.textContent = 'Game Running';
                gameStatus.classList.add('running');
            } else {
                // Pausing the game - store current direction
                gameState.lastBallSpeedX = gameState.ballSpeedX;
                gameState.lastBallSpeedY = gameState.ballSpeedY;
                gameState.ballSpeedX = 0;
                gameState.ballSpeedY = 0;
                gameStatus.textContent = 'Game Paused';
                gameStatus.classList.remove('running');
            }
            
            startButton.textContent = gameState.isPaused ? 'Start Game' : 'Pause Game';
            startButton.classList.toggle('active', !gameState.isPaused);
        }
    }

    function resetGame() {
        console.log('Resetting game...');
        gameState = {
            player1Score: 0,
            player2Score: 0,
            player1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            player2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            player1Trail: [],
            player2Trail: [],
            player1HitEffect: 0,
            player2HitEffect: 0,
            ballX: CANVAS_WIDTH / 2,
            ballY: CANVAS_HEIGHT / 2,
            ballSpeedX: 0,
            ballSpeedY: 0,
            lastBallSpeedX: 0,
            lastBallSpeedY: 0,
            currentSpeedMultiplier: 1,
            isPaused: true,
            isGameOver: false,
            ballHitEffect: 0,
            ballHitX: 0,
            ballHitY: 0
        };
        updateScore(0); // Pass 0 to indicate no scoring player (reset)
        closeVictoryOverlay();
        gameStatus.textContent = 'Click Start to Play';
        gameStatus.classList.remove('running');
        startButton.textContent = 'Start Game';
        startButton.classList.remove('active');
    }

    function updateScore(scoringPlayer) {
        // Remove any existing animation classes
        player1ScoreElement.classList.remove('score-changed');
        player2ScoreElement.classList.remove('score-changed');
        
        // Update the score text
        player1ScoreElement.textContent = gameState.player1Score;
        player2ScoreElement.textContent = gameState.player2Score;
        
        if (scoringPlayer === 0) {
            // Reset case - animate both scores
            void player1ScoreElement.offsetWidth;
            void player2ScoreElement.offsetWidth;
            player1ScoreElement.classList.add('score-changed');
            player2ScoreElement.classList.add('score-changed');
        } else if (scoringPlayer === 1) {
            // Force a reflow to restart animation
            void player1ScoreElement.offsetWidth;
            player1ScoreElement.classList.add('score-changed');
        } else if (scoringPlayer === 2) {
            // Force a reflow to restart animation
            void player2ScoreElement.offsetWidth;
            player2ScoreElement.classList.add('score-changed');
        }
    }

    function movePaddles() {
        // Store previous position for trail effect
        gameState.player1Trail.unshift(gameState.player1Y);
        gameState.player2Trail.unshift(gameState.player2Y);
        
        // Limit trail length
        if (gameState.player1Trail.length > TRAIL_LENGTH) {
            gameState.player1Trail.pop();
        }
        if (gameState.player2Trail.length > TRAIL_LENGTH) {
            gameState.player2Trail.pop();
        }

        // Player 1 (W/S)
        if (keys.w && gameState.player1Y > 0) {
            gameState.player1Y -= PADDLE_SPEED;
        }
        if (keys.s && gameState.player1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            gameState.player1Y += PADDLE_SPEED;
        }

        // Player 2 (Arrow Up/Down)
        if (keys.ArrowUp && gameState.player2Y > 0) {
            gameState.player2Y -= PADDLE_SPEED;
        }
        if (keys.ArrowDown && gameState.player2Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            gameState.player2Y += PADDLE_SPEED;
        }
    }

    function moveBall() {
        if (gameState.isPaused || gameState.isGameOver) return;

        gameState.ballX += gameState.ballSpeedX;
        gameState.ballY += gameState.ballSpeedY;

        // Ball collision with top and bottom walls
        if (gameState.ballY <= 0 || gameState.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
            gameState.ballSpeedY = -gameState.ballSpeedY;
        }

        // Ball collision with paddles
        if (gameState.ballX <= PADDLE_WIDTH && 
            gameState.ballY + BALL_SIZE >= gameState.player1Y && 
            gameState.ballY <= gameState.player1Y + PADDLE_HEIGHT) {
            // Trigger hit effect for player 1
            gameState.player1HitEffect = Date.now();
            // Add ball hit effect
            gameState.ballHitEffect = Date.now();
            gameState.ballHitX = gameState.ballX;
            gameState.ballHitY = gameState.ballY;
            
            // Calculate angle based on where the ball hits the paddle
            const relativeIntersectY = (gameState.player1Y + (PADDLE_HEIGHT / 2)) - gameState.ballY;
            const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
            const bounceAngle = normalizedIntersectY * Math.PI / 4;
            
            // Increase speed but cap it at maximum
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            const currentSpeed = BALL_SPEED * gameState.currentSpeedMultiplier;
            
            gameState.ballSpeedX = currentSpeed * Math.cos(bounceAngle);
            gameState.ballSpeedY = -currentSpeed * Math.sin(bounceAngle);
            
            // Ensure ball moves right
            if (gameState.ballSpeedX < 0) {
                gameState.ballSpeedX = -gameState.ballSpeedX;
            }
        }

        if (gameState.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE && 
            gameState.ballY + BALL_SIZE >= gameState.player2Y && 
            gameState.ballY <= gameState.player2Y + PADDLE_HEIGHT) {
            // Trigger hit effect for player 2
            gameState.player2HitEffect = Date.now();
            // Add ball hit effect
            gameState.ballHitEffect = Date.now();
            gameState.ballHitX = gameState.ballX;
            gameState.ballHitY = gameState.ballY;
            
            // Calculate angle based on where the ball hits the paddle
            const relativeIntersectY = (gameState.player2Y + (PADDLE_HEIGHT / 2)) - gameState.ballY;
            const normalizedIntersectY = relativeIntersectY / (PADDLE_HEIGHT / 2);
            const bounceAngle = normalizedIntersectY * Math.PI / 4;
            
            // Increase speed but cap it at maximum
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            const currentSpeed = BALL_SPEED * gameState.currentSpeedMultiplier;
            
            gameState.ballSpeedX = currentSpeed * Math.cos(bounceAngle);
            gameState.ballSpeedY = -currentSpeed * Math.sin(bounceAngle);
            
            // Ensure ball moves left
            if (gameState.ballSpeedX > 0) {
                gameState.ballSpeedX = -gameState.ballSpeedX;
            }
        }

        // Ball out of bounds
        if (gameState.ballX < 0) {
            // Player 2 scores
            gameState.player2Score++;
            updateScore(2);
            resetBall();
            checkWinner();
        } else if (gameState.ballX > CANVAS_WIDTH) {
            // Player 1 scores
            gameState.player1Score++;
            updateScore(1);
            resetBall();
            checkWinner();
        }
    }

    function resetBall() {
        gameState.ballX = CANVAS_WIDTH / 2;
        gameState.ballY = CANVAS_HEIGHT / 2;
        gameState.ballSpeedX = 0;
        gameState.ballSpeedY = 0;
        gameState.lastBallSpeedX = 0;
        gameState.lastBallSpeedY = 0;
        gameState.currentSpeedMultiplier = 1;
        gameState.isPaused = true;
        gameStatus.textContent = 'Click Start to Continue';
        startButton.textContent = 'Start Game';
        startButton.classList.remove('active');
    }

    function checkWinner() {
        if (gameState.player1Score >= WINNING_SCORE || gameState.player2Score >= WINNING_SCORE) {
            gameState.isGameOver = true;
            showVictoryScreen();
        }
    }

    function showVictoryScreen() {
        const overlay = document.getElementById('victory-overlay');
        const title = overlay.querySelector('.victory-title');
        const message = overlay.querySelector('.victory-message');
        const score = overlay.querySelector('#final-score');
        
        const winner = gameState.player1Score > gameState.player2Score ? 'Player 1' : 'Player 2';
        title.textContent = `${winner} Wins!`;
        message.textContent = `Congratulations ${winner}!`;
        score.textContent = `${gameState.player1Score} - ${gameState.player2Score}`;
        
        overlay.classList.add('active');
    }

    function closeVictoryOverlay() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    function draw() {
        // Clear canvas with dark background
        ctx.fillStyle = '#1a1b26';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw table border
        ctx.strokeStyle = '#30365f';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);

        // Draw center line
        ctx.strokeStyle = '#30365f';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);

        // Function to draw rounded rectangle with front-side only rounding
        function drawPaddle(x, y, width, height, isRightPaddle) {
            ctx.beginPath();
            if (isRightPaddle) {
                // Right paddle - round left corners (mirrored from left paddle)
                ctx.moveTo(x + width, y);
                ctx.lineTo(x, y + height/4);
                ctx.quadraticCurveTo(x + width/2, y + height/8, x, y);
                ctx.lineTo(x, y + height);
                ctx.quadraticCurveTo(x + width/2, y + height - height/8, x, y + height - height/4);
                ctx.lineTo(x + width, y + height);
                ctx.lineTo(x + width, y);
            } else {
                // Left paddle - round right corners
                ctx.moveTo(x, y);
                ctx.lineTo(x + width, y + height/4);
                ctx.quadraticCurveTo(x + width/2, y + height/8, x + width, y);
                ctx.lineTo(x + width, y + height);
                ctx.quadraticCurveTo(x + width/2, y + height - height/8, x + width, y + height - height/4);
                ctx.lineTo(x, y + height);
                ctx.lineTo(x, y);
            }
            ctx.closePath();
        }

        // Draw paddle trails
        function drawPaddleTrail(trail, x, baseColor, isRight = false) {
            trail.forEach((y, index) => {
                const alpha = (TRAIL_LENGTH - index) / (TRAIL_LENGTH * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
                drawPaddle(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, isRight);
                ctx.fill();
            });
        }

        // Draw trails
        drawPaddleTrail(gameState.player1Trail, 0, '#00ffff', false);
        drawPaddleTrail(gameState.player2Trail, CANVAS_WIDTH - PADDLE_WIDTH, '#ff00ff', true);

        // Calculate hit effect intensity
        const player1HitIntensity = Math.max(0, 1 - (Date.now() - gameState.player1HitEffect) / HIT_EFFECT_DURATION);
        const player2HitIntensity = Math.max(0, 1 - (Date.now() - gameState.player2HitEffect) / HIT_EFFECT_DURATION);

        // Draw left paddle with enhanced effects
        ctx.save();
        const leftPaddleGradient = ctx.createLinearGradient(0, gameState.player1Y, PADDLE_WIDTH * 2, gameState.player1Y + PADDLE_HEIGHT);
        leftPaddleGradient.addColorStop(0, `rgba(0, 255, 255, ${0.8 + player1HitIntensity * 0.2})`);
        leftPaddleGradient.addColorStop(0.5, `rgba(0, 200, 255, ${0.9 + player1HitIntensity * 0.1})`);
        leftPaddleGradient.addColorStop(1, `rgba(0, 150, 255, ${0.8 + player1HitIntensity * 0.2})`);

        // Main paddle
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15 + player1HitIntensity * 15;
        ctx.fillStyle = leftPaddleGradient;
        drawPaddle(0, gameState.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT, false);
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + player1HitIntensity * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw right paddle with enhanced effects
        ctx.save();
        const rightPaddleGradient = ctx.createLinearGradient(CANVAS_WIDTH - PADDLE_WIDTH * 2, gameState.player2Y, CANVAS_WIDTH, gameState.player2Y + PADDLE_HEIGHT);
        rightPaddleGradient.addColorStop(0, `rgba(255, 0, 255, ${0.8 + player2HitIntensity * 0.2})`);
        rightPaddleGradient.addColorStop(0.5, `rgba(255, 0, 200, ${0.9 + player2HitIntensity * 0.1})`);
        rightPaddleGradient.addColorStop(1, `rgba(255, 0, 150, ${0.8 + player2HitIntensity * 0.2})`);

        // Main paddle
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15 + player2HitIntensity * 15;
        ctx.fillStyle = rightPaddleGradient;
        drawPaddle(CANVAS_WIDTH - PADDLE_WIDTH, gameState.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, true);
        ctx.fill();

        // Edge highlight
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + player2HitIntensity * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw energy ball
        ctx.save();
        
        // Create time-based effects
        const time = Date.now() / 1000;
        const pulseIntensity = Math.sin(time * 3) * 0.15 + 0.85; // Faster, subtler pulse
        
        // Outer glow effect
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20 + Math.sin(time * 4) * 5; // Dynamic glow intensity
        
        // Main orb gradient
        const orbGradient = ctx.createRadialGradient(
            gameState.ballX,
            gameState.ballY,
            0,
            gameState.ballX,
            gameState.ballY,
            BALL_SIZE / 1.5
        );
        orbGradient.addColorStop(0, '#ffffff');
        orbGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
        orbGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        orbGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Draw main orb
        ctx.globalAlpha = pulseIntensity;
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add energy rings
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringPhase = time * (1 + i * 0.5) + (Math.PI * 2 * i) / ringCount;
            const ringSize = (BALL_SIZE / 2) * (0.6 + Math.sin(ringPhase) * 0.4);
            
            ctx.beginPath();
            ctx.arc(gameState.ballX, gameState.ballY, ringSize, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * pulseIntensity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Add particle effects
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particleAngle = time * 2 + (Math.PI * 2 * i) / particleCount;
            const particleDistance = BALL_SIZE / 2 * (0.4 + Math.sin(time * 3 + i) * 0.2);
            
            // Particle position with spiral motion
            const x = gameState.ballX + Math.cos(particleAngle) * particleDistance;
            const y = gameState.ballY + Math.sin(particleAngle) * particleDistance;
            
            // Draw particle with dynamic size
            const particleSize = (BALL_SIZE / 8) * (0.8 + Math.sin(time * 4 + i) * 0.2);
            ctx.globalAlpha = 0.6 * pulseIntensity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add energy streams
        ctx.globalAlpha = 0.4 * pulseIntensity;
        for (let i = 0; i < 12; i++) {
            const streamAngle = (Math.PI * 2 * i) / 12 + time;
            const innerRadius = BALL_SIZE / 4;
            const outerRadius = BALL_SIZE / 2;
            
            // Create wavy effect
            const waveOffset = Math.sin(time * 4 + i) * 0.2;
            
            ctx.beginPath();
            ctx.moveTo(
                gameState.ballX + Math.cos(streamAngle) * innerRadius,
                gameState.ballY + Math.sin(streamAngle) * innerRadius
            );
            ctx.lineTo(
                gameState.ballX + Math.cos(streamAngle + waveOffset) * outerRadius,
                gameState.ballY + Math.sin(streamAngle + waveOffset) * outerRadius
            );
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * pulseIntensity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Inner core highlight
        const coreGradient = ctx.createRadialGradient(
            gameState.ballX - BALL_SIZE / 6,
            gameState.ballY - BALL_SIZE / 6,
            0,
            gameState.ballX,
            gameState.ballY,
            BALL_SIZE / 3
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.globalAlpha = pulseIntensity;
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw ball hit effect
        const hitEffectAge = Date.now() - gameState.ballHitEffect;
        if (hitEffectAge < HIT_EFFECT_DURATION) {
            const hitIntensity = 1 - (hitEffectAge / HIT_EFFECT_DURATION);
            
            // Expanding rings
            const ringCount = 3;
            for (let i = 0; i < ringCount; i++) {
                const ringProgress = (hitEffectAge / HIT_EFFECT_DURATION) + (i / ringCount);
                const ringSize = BALL_SIZE * (1 + ringProgress * 2);
                const ringOpacity = Math.max(0, hitIntensity - (i / ringCount) * 0.5);
                
                ctx.beginPath();
                ctx.arc(gameState.ballHitX, gameState.ballHitY, ringSize, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ringOpacity * 0.5})`;
                ctx.lineWidth = 2 * (1 - ringProgress);
                ctx.stroke();
            }
            
            // Energy particles
            const particleCount = 12;
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = BALL_SIZE * (1 + hitEffectAge / HIT_EFFECT_DURATION * 2);
                const x = gameState.ballHitX + Math.cos(angle) * distance;
                const y = gameState.ballHitY + Math.sin(angle) * distance;
                
                const particleSize = BALL_SIZE / 6 * (1 - hitEffectAge / HIT_EFFECT_DURATION);
                ctx.globalAlpha = hitIntensity * 0.7;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, particleSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Shockwave effect
            const shockwaveSize = BALL_SIZE * (1 + hitEffectAge / HIT_EFFECT_DURATION * 3);
            const shockwaveGradient = ctx.createRadialGradient(
                gameState.ballHitX,
                gameState.ballHitY,
                0,
                gameState.ballHitX,
                gameState.ballHitY,
                shockwaveSize
            );
            shockwaveGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            shockwaveGradient.addColorStop(0.7, `rgba(255, 255, 255, ${hitIntensity * 0.2})`);
            shockwaveGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.globalAlpha = hitIntensity * 0.5;
            ctx.fillStyle = shockwaveGradient;
            ctx.beginPath();
            ctx.arc(gameState.ballHitX, gameState.ballHitY, shockwaveSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function gameLoop() {
        // Always draw, even when paused
        draw();
        
        if (!gameState.isPaused && !gameState.isGameOver) {
            movePaddles();
            moveBall();
        }
        
        requestAnimationFrame(gameLoop);
    }

    // Initialize game
    resetGame();

    // Add controls help section
    const controlsHelp = document.createElement('div');
    controlsHelp.className = 'controls-help';
    
    // Add title
    const controlsTitle = document.createElement('div');
    controlsTitle.className = 'controls-title';
    controlsTitle.textContent = 'Game Controls';
    controlsHelp.appendChild(controlsTitle);

    // Create container for controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    
    // Player 1 controls
    const player1Controls = document.createElement('div');
    player1Controls.className = 'control-group';
    player1Controls.innerHTML = `
        <div class="player-controls">
            <div class="player-label">Player 1</div>
            <div class="key-group">
                <kbd>W</kbd>
                <span class="key-separator">/</span>
                <kbd>S</kbd>
            </div>
        </div>
    `;
    
    // Player 2 controls
    const player2Controls = document.createElement('div');
    player2Controls.className = 'control-group';
    player2Controls.innerHTML = `
        <div class="player-controls">
            <div class="player-label">Player 2</div>
            <div class="key-group">
                <kbd>↑</kbd>
                <span class="key-separator">/</span>
                <kbd>↓</kbd>
            </div>
        </div>
    `;
    
    // Game controls
    const gameControls = document.createElement('div');
    gameControls.className = 'control-group';
    gameControls.innerHTML = `
        <div class="player-controls">
            <div class="player-label">Pause/Start</div>
            <div class="key-group">
                <kbd>Space</kbd>
            </div>
        </div>
    `;
    
    // Add all controls to the container
    controlsContainer.appendChild(player1Controls);
    controlsContainer.appendChild(player2Controls);
    controlsContainer.appendChild(gameControls);
    
    // Add container to the help section
    controlsHelp.appendChild(controlsContainer);
    
    // Add the controls help section to the game container
    document.querySelector('.game-container').appendChild(controlsHelp);

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    startButton.addEventListener('click', function() {
        console.log('Start button clicked');
        togglePause();
    });

    resetButton.addEventListener('click', resetGame);

    // Prevent space bar from scrolling
    window.addEventListener('keydown', function(e) {
        if(e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
        }
    });

    // Make sure the game loop starts
    gameLoop();
}); 