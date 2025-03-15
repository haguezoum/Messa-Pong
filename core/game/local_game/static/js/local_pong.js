// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 18;
const PADDLE_SPEED = 10;
const BALL_SPEED = 5;
const SPEED_INCREASE = 1.05; // Reduced speed multiplier when ball hits paddle
const MAX_BALL_SPEED = 12; // Reduced maximum ball speed for better control
const WINNING_SCORE = 5;
const TRAIL_LENGTH = 3;  // Reduced trail length for better performance
const HIT_EFFECT_DURATION = 200; // Duration of hit effect in milliseconds

// AI difficulty settings
const AI_DIFFICULTIES = {
    easy: {
        reactionTime: 32,
        predictionError: 40,
        label: 'Easy'
    },
    medium: {
        reactionTime: 16,
        predictionError: 20,
        label: 'Medium'
    },
    hard: {
        reactionTime: 8,
        predictionError: 10,
        label: 'Hard'
    }
};

let currentAIDifficulty = 'medium';
const IS_AI_MODE = window.location.pathname.includes('/local/ai');

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
    
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: disable alpha for better performance
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
        lastAIUpdate: 0
    };

    // Key states
    const keys = {
        w: false,
        s: false,
        ArrowUp: !IS_AI_MODE,
        ArrowDown: !IS_AI_MODE
    };

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    console.log('Canvas size set to:', canvas.width, canvas.height);

    function handleKeyDown(e) {
        if (e.key in keys && keys[e.key] !== undefined) {
            keys[e.key] = true;
            e.preventDefault();
        }
        if (e.key === ' ' || e.code === 'Space') {
            togglePause();
            e.preventDefault();
        }
    }

    function handleKeyUp(e) {
        if (e.key in keys && keys[e.key] !== undefined) {
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
                gameStatus.classList.remove('error');
                gameStatus.classList.add('success');
                gameStatus.classList.add('running');
            } else {
                // Pausing the game - store current direction
                gameState.lastBallSpeedX = gameState.ballSpeedX;
                gameState.lastBallSpeedY = gameState.ballSpeedY;
                gameState.ballSpeedX = 0;
                gameState.ballSpeedY = 0;
                gameStatus.textContent = 'Game Paused';
                gameStatus.classList.remove('success');
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
            lastAIUpdate: 0
        };
        updateScore(0); // Pass 0 to indicate no scoring player (reset)
        closeVictoryOverlay();
        gameStatus.textContent = 'Click Start to Play';
        gameStatus.classList.remove('running');
        gameStatus.classList.remove('success');
        gameStatus.classList.remove('error');
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

    function predictBallY() {
        const aiSettings = AI_DIFFICULTIES[currentAIDifficulty];
        
        if (gameState.ballSpeedX <= 0) {
            return gameState.player2Y + PADDLE_HEIGHT / 2;
        }

        const distanceToRightPaddle = CANVAS_WIDTH - PADDLE_WIDTH - gameState.ballX;
        const timeToReachPaddle = distanceToRightPaddle / Math.abs(gameState.ballSpeedX);
        
        let predictedY = gameState.ballY + (gameState.ballSpeedY * timeToReachPaddle);
        
        while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
            if (predictedY < 0) {
                predictedY = -predictedY;
            } else if (predictedY > CANVAS_HEIGHT) {
                predictedY = 2 * CANVAS_HEIGHT - predictedY;
            }
        }
        
        predictedY += (Math.random() - 0.5) * aiSettings.predictionError;
        
        return predictedY;
    }

    function updateAIPaddle() {
        const currentTime = Date.now();
        const aiSettings = AI_DIFFICULTIES[currentAIDifficulty];
        
        if (currentTime - gameState.lastAIUpdate < aiSettings.reactionTime) {
            return;
        }
        gameState.lastAIUpdate = currentTime;

        const predictedBallY = predictBallY();
        const paddleCenter = gameState.player2Y + PADDLE_HEIGHT / 2;
        
        if (paddleCenter < predictedBallY - 5) {
            gameState.player2Y = Math.min(gameState.player2Y + PADDLE_SPEED, CANVAS_HEIGHT - PADDLE_HEIGHT);
        } else if (paddleCenter > predictedBallY + 5) {
            gameState.player2Y = Math.max(gameState.player2Y - PADDLE_SPEED, 0);
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

        // Player 2 (AI or Arrow Keys)
        if (IS_AI_MODE) {
            if (!gameState.isPaused && !gameState.isGameOver) {
                updateAIPaddle();
            }
        } else {
            if (keys.ArrowUp && gameState.player2Y > 0) {
                gameState.player2Y -= PADDLE_SPEED;
            }
            if (keys.ArrowDown && gameState.player2Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
                gameState.player2Y += PADDLE_SPEED;
            }
        }
    }

    function moveBall() {
        // Update ball position
        gameState.ballX += gameState.ballSpeedX;
        gameState.ballY += gameState.ballSpeedY;
        
        // Ball collision with top and bottom walls
        if (gameState.ballY <= BALL_SIZE / 2 || gameState.ballY >= CANVAS_HEIGHT - BALL_SIZE / 2) {
            gameState.ballSpeedY = -gameState.ballSpeedY;
            
            // Ensure ball doesn't get stuck in the wall
            if (gameState.ballY <= BALL_SIZE / 2) {
                gameState.ballY = BALL_SIZE / 2;
            } else {
                gameState.ballY = CANVAS_HEIGHT - BALL_SIZE / 2;
            }
        }
        
        // Ball collision with paddles
        if (checkPaddleCollision()) {
            // Ball direction has been changed in the collision function
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

    function checkPaddleCollision() {
        // Left paddle collision
        if (gameState.ballX - BALL_SIZE / 2 <= PADDLE_WIDTH && 
            gameState.ballY >= gameState.player1Y && 
            gameState.ballY <= gameState.player1Y + PADDLE_HEIGHT) {
            
            // Calculate normalized hit position (-0.5 to 0.5)
            const hitPosition = (gameState.ballY - (gameState.player1Y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT;
            
            // Reverse X direction and add some Y based on where the paddle was hit
            gameState.ballSpeedX = Math.abs(gameState.ballSpeedX) * gameState.currentSpeedMultiplier;
            gameState.ballSpeedY += hitPosition * 5; // Add Y velocity based on hit position
            
            // Increase speed but cap it
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            
            // Ensure ball is not stuck inside paddle
            gameState.ballX = PADDLE_WIDTH + BALL_SIZE / 2;
            
            // Add hit effect to paddle
            gameState.player1HitEffect = Date.now();
            
            return true;
        }
        
        // Right paddle collision
        if (gameState.ballX + BALL_SIZE / 2 >= CANVAS_WIDTH - PADDLE_WIDTH && 
            gameState.ballY >= gameState.player2Y && 
            gameState.ballY <= gameState.player2Y + PADDLE_HEIGHT) {
            
            // Calculate normalized hit position (-0.5 to 0.5)
            const hitPosition = (gameState.ballY - (gameState.player2Y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT;
            
            // Reverse X direction and add some Y based on where the paddle was hit
            gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX) * gameState.currentSpeedMultiplier;
            gameState.ballSpeedY += hitPosition * 5; // Add Y velocity based on hit position
            
            // Increase speed but cap it
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            
            // Ensure ball is not stuck inside paddle
            gameState.ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2;
            
            // Add hit effect to paddle
            gameState.player2HitEffect = Date.now();
            
            return true;
        }
        
        return false;
    }

    function resetBall() {
        gameState.ballX = CANVAS_WIDTH / 2;
        gameState.ballY = CANVAS_HEIGHT / 2;
        gameState.ballSpeedX = 0;
        gameState.ballSpeedY = 0;
        gameState.currentSpeedMultiplier = 1;
        gameStatus.textContent = 'Press Start to Play';
        gameStatus.classList.remove('running');
        gameStatus.classList.remove('success');
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
        
        let winner;
        if (IS_AI_MODE) {
            winner = gameState.player1Score > gameState.player2Score ? 'You' : 'AI';
        } else {
            winner = gameState.player1Score > gameState.player2Score ? 'Player 1' : 'Player 2';
        }
        
        title.textContent = `${winner} Win!`;
        message.textContent = `Congratulations ${winner}!`;
        score.textContent = `${gameState.player1Score} - ${gameState.player2Score}`;
        
        overlay.style.display = 'flex';
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

        // Draw paddles and their trails
        drawPaddleTrail(gameState.player1Trail, 0, '#00ffff', false);
        drawPaddleTrail(gameState.player2Trail, CANVAS_WIDTH - PADDLE_WIDTH, '#ff00ff', true);
        
        // Draw left paddle with enhanced effects
        ctx.save();
        const leftPaddleGradient = ctx.createLinearGradient(0, gameState.player1Y, PADDLE_WIDTH * 2, gameState.player1Y + PADDLE_HEIGHT);
        leftPaddleGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        leftPaddleGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.9)');
        leftPaddleGradient.addColorStop(1, 'rgba(0, 150, 255, 0.8)');

        // Main paddle
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = leftPaddleGradient;
        drawPaddle(0, gameState.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT, false);
        ctx.fill();
        
        // Edge highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw right paddle with enhanced effects
        ctx.save();
        const rightPaddleGradient = ctx.createLinearGradient(CANVAS_WIDTH - PADDLE_WIDTH * 2, gameState.player2Y, CANVAS_WIDTH, gameState.player2Y + PADDLE_HEIGHT);
        rightPaddleGradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        rightPaddleGradient.addColorStop(0.5, 'rgba(255, 0, 200, 0.9)');
        rightPaddleGradient.addColorStop(1, 'rgba(255, 0, 150, 0.8)');

        // Main paddle
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = rightPaddleGradient;
        drawPaddle(CANVAS_WIDTH - PADDLE_WIDTH, gameState.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, true);
        ctx.fill();
        
        // Edge highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // Draw paddle hit effects
        drawPaddleHitEffect(1);
        drawPaddleHitEffect(2);
        
        // Draw ball
        drawBall();
    }

    function drawBall() {
        ctx.save();
        
        // Create time-based effects
        const time = Date.now() / 1000;
        const pulseIntensity = Math.sin(time * 2) * 0.1 + 0.9; // Subtle pulse
        
        // Outer glow effect - light blue for snow
        ctx.shadowColor = 'rgba(200, 230, 255, 0.8)';
        ctx.shadowBlur = 15 + Math.sin(time * 3) * 3; // Dynamic glow intensity
        
        // Main snowball gradient
        const snowGradient = ctx.createRadialGradient(
            gameState.ballX,
            gameState.ballY,
            0,
            gameState.ballX,
            gameState.ballY,
            BALL_SIZE / 1.8
        );
        snowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        snowGradient.addColorStop(0.7, 'rgba(230, 240, 255, 0.9)');
        snowGradient.addColorStop(1, 'rgba(200, 230, 255, 0.7)');
        
        // Draw main snowball
        ctx.globalAlpha = 1;
        ctx.fillStyle = snowGradient;
        ctx.beginPath();
        ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Add snow texture/highlights
        const highlightCount = 8;
        for (let i = 0; i < highlightCount; i++) {
            const angle = (Math.PI * 2 * i) / highlightCount + time * 0.2;
            const distance = BALL_SIZE / 4 * (0.3 + Math.sin(time * 2 + i) * 0.1);
            
            // Highlight position with subtle movement
            const x = gameState.ballX + Math.cos(angle) * distance;
            const y = gameState.ballY + Math.sin(angle) * distance;
            
            // Draw snow highlight
            const highlightSize = (BALL_SIZE / 10) * (0.8 + Math.sin(time * 3 + i) * 0.2);
            ctx.globalAlpha = 0.7 * pulseIntensity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, highlightSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add frost sparkle effect
        const sparkleCount = 4;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleAngle = time * 3 + (Math.PI * 2 * i) / sparkleCount;
            const sparkleDistance = BALL_SIZE / 3 * (0.5 + Math.sin(time * 4 + i) * 0.2);
            
            const sx = gameState.ballX + Math.cos(sparkleAngle) * sparkleDistance;
            const sy = gameState.ballY + Math.sin(sparkleAngle) * sparkleDistance;
            
            // Draw sparkle
            ctx.globalAlpha = 0.6 * pulseIntensity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            
            // Star shape for sparkle
            ctx.beginPath();
            const sparkleSize = BALL_SIZE / 12;
            for (let j = 0; j < 5; j++) {
                const starAngle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                const x1 = sx + Math.cos(starAngle) * sparkleSize;
                const y1 = sy + Math.sin(starAngle) * sparkleSize;
                const x2 = sx + Math.cos(starAngle + Math.PI/5) * (sparkleSize/2);
                const y2 = sy + Math.sin(starAngle + Math.PI/5) * (sparkleSize/2);
                
                if (j === 0) {
                    ctx.moveTo(x1, y1);
                } else {
                    ctx.lineTo(x1, y1);
                }
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fill();
        }

        // Add subtle blue tint to edges for ice effect
        const iceGradient = ctx.createRadialGradient(
            gameState.ballX,
            gameState.ballY,
            BALL_SIZE / 3,
            gameState.ballX,
            gameState.ballY,
            BALL_SIZE / 2
        );
        iceGradient.addColorStop(0, 'rgba(200, 230, 255, 0)');
        iceGradient.addColorStop(1, 'rgba(180, 220, 255, 0.3)');
        
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = iceGradient;
        ctx.beginPath();
        ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

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

    function drawPaddleTrail(trail, x, baseColor, isRight = false) {
        trail.forEach((y, index) => {
            const alpha = (TRAIL_LENGTH - index) / (TRAIL_LENGTH * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
            drawPaddle(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, isRight);
            ctx.fill();
        });
    }

    function drawPaddleHitEffect(player) {
        const hitEffect = player === 1 ? gameState.player1HitEffect : gameState.player2HitEffect;
        const hitIntensity = Math.max(0, 1 - (Date.now() - hitEffect) / 200);
        
        if (hitIntensity <= 0) return;
        
        const paddleX = player === 1 ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
        const paddleY = player === 1 ? gameState.player1Y : gameState.player2Y;
        const paddleColor = player === 1 ? '#00ffff' : '#ff00ff';
        
        // Draw glow effect
        ctx.save();
        ctx.globalAlpha = hitIntensity * 0.5;
        ctx.shadowColor = paddleColor;
        ctx.shadowBlur = 15 * hitIntensity;
        ctx.fillStyle = `rgba(${player === 1 ? '0, 255, 255' : '255, 0, 255'}, 0.3)`;
        drawPaddle(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, player === 2);
        ctx.fill();
        ctx.restore();
    }

    // Performance optimization
    const FRAME_RATE = 60;
    const FRAME_INTERVAL = 1000 / FRAME_RATE;
    let lastFrameTime = 0;
    let frameCount = 0;
    let lastFpsUpdateTime = 0;
    let animationFrameId = null;

    function update(currentTime) {
        // Request next frame immediately for smoother animation
        animationFrameId = requestAnimationFrame(update);
        
        if (!lastFrameTime) {
            lastFrameTime = currentTime;
            lastFpsUpdateTime = currentTime;
            return;
        }
        
        const deltaTime = currentTime - lastFrameTime;
        
        // Skip frames if we're running too fast
        if (deltaTime < FRAME_INTERVAL) {
            return;
        }
        
        // Update game state
        if (!gameState.isPaused && !gameState.isGameOver) {
            movePaddles();
            moveBall();
        }
        
        // Render
        draw();
        
        // FPS calculation (for debugging)
        frameCount++;
        if (currentTime - lastFpsUpdateTime >= 1000) {
            // console.log(`FPS: ${frameCount}`);
            frameCount = 0;
            lastFpsUpdateTime = currentTime;
        }
        
        // Calculate how much time has passed
        const elapsed = currentTime - lastFrameTime;
        // Update last frame time, accounting for any extra time
        lastFrameTime = currentTime - (elapsed % FRAME_INTERVAL);
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
            <div class="player-label">Player Controls</div>
            <div class="key-group">
                <kbd>W</kbd>
                <span class="key-separator">/</span>
                <kbd>S</kbd>
            </div>
        </div>
    `;
    
    // AI Difficulty controls
    const aiControls = document.createElement('div');
    aiControls.className = 'control-group';
    aiControls.innerHTML = `
        <div class="player-controls">
            <div class="player-label">AI Difficulty</div>
            <div class="difficulty-controls">
                <div class="difficulty-list">
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="easy" />
                        <span class="difficulty-label">Easy</span>
                        <span class="difficulty-description">Slower reactions, less accurate</span>
                    </label>
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="medium" checked />
                        <span class="difficulty-label">Medium</span>
                        <span class="difficulty-description">Balanced speed and accuracy</span>
                    </label>
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="hard" />
                        <span class="difficulty-label">Hard</span>
                        <span class="difficulty-description">Fast reactions, high accuracy</span>
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Game controls
    const gameControls = document.createElement('div');
    gameControls.className = 'control-group';
    gameControls.innerHTML = `
        <div class="player-controls">
            <div class="player-label">Game Controls</div>
            <div class="key-group">
                <kbd>Space</kbd>
                <span class="key-label">Start/Pause</span>
            </div>
        </div>
    `;
    
    // Add all controls to the container
    controlsContainer.appendChild(player1Controls);
    if (IS_AI_MODE) {
        controlsContainer.appendChild(aiControls);
    }
    controlsContainer.appendChild(gameControls);
    
    // Add container to the help section
    controlsHelp.appendChild(controlsContainer);
    
    // Add the controls help section to the game container
    document.querySelector('.game-container').appendChild(controlsHelp);

    // Add event listeners
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

    // Add event listeners for difficulty buttons
    if (IS_AI_MODE) {
        const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
        difficultyInputs.forEach(input => {
            input.addEventListener('change', function() {
                const difficulty = this.value;
                currentAIDifficulty = difficulty;
                
                // Reset the game when changing difficulty
                resetGame();
            });
        });
    }

    // Start the game loop
    update();
}); 