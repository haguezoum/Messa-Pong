// Extend the local pong game with AI functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game...');
    
    // Get DOM elements
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element:', canvas);
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;
    console.log('Canvas size set to:', canvas.width, canvas.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const gameStatus = document.getElementById('game-status');
    const player1ScoreElement = document.getElementById('player1-score');
    const player2ScoreElement = document.getElementById('player2-score');

    // Game constants
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 500;
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 18;
    const PADDLE_SPEED = 10;
    const BALL_SPEED = 5;
    const SPEED_INCREASE = 1.05;
    const MAX_BALL_SPEED = 12;
    const WINNING_SCORE = 5;
    const TRAIL_LENGTH = 3;
    const HIT_EFFECT_DURATION = 200;
    const AI_REACTION_TIME = 16; // ms delay for AI decisions
    const AI_PREDICTION_ERROR = 20; // pixels of random error in AI prediction

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
        lastBallSpeedX: 0,
        lastBallSpeedY: 0,
        currentSpeedMultiplier: 1,
        isPaused: true,
        isGameOver: false,
        lastAIUpdate: 0
    };

    // Key states (only for player 1 since player 2 is AI)
    const keys = {
        w: false,
        s: false
    };

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
        if (!gameState.isGameOver) {
            gameState.isPaused = !gameState.isPaused;
            
            if (!gameState.isPaused) {
                if (gameState.lastBallSpeedX === 0 && gameState.lastBallSpeedY === 0) {
                    gameState.ballSpeedX = BALL_SPEED * (Math.random() < 0.5 ? 1 : -1);
                    gameState.ballSpeedY = BALL_SPEED * (Math.random() * 2 - 1) * 0.5;
                } else {
                    gameState.ballSpeedX = gameState.lastBallSpeedX;
                    gameState.ballSpeedY = gameState.lastBallSpeedY;
                }
                gameStatus.textContent = 'Game Running';
                gameStatus.classList.remove('error');
                gameStatus.classList.add('success');
                gameStatus.classList.add('running');
            } else {
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
        updateScore(0);
        closeVictoryOverlay();
        gameStatus.textContent = 'Click Start to Play';
        gameStatus.classList.remove('running');
        gameStatus.classList.remove('success');
        gameStatus.classList.remove('error');
        startButton.textContent = 'Start Game';
        startButton.classList.remove('active');
    }

    function updateScore(scoringPlayer) {
        player1ScoreElement.classList.remove('score-changed');
        player2ScoreElement.classList.remove('score-changed');
        
        player1ScoreElement.textContent = gameState.player1Score;
        player2ScoreElement.textContent = gameState.player2Score;
        
        if (scoringPlayer === 0) {
            void player1ScoreElement.offsetWidth;
            void player2ScoreElement.offsetWidth;
            player1ScoreElement.classList.add('score-changed');
            player2ScoreElement.classList.add('score-changed');
        } else if (scoringPlayer === 1) {
            void player1ScoreElement.offsetWidth;
            player1ScoreElement.classList.add('score-changed');
        } else if (scoringPlayer === 2) {
            void player2ScoreElement.offsetWidth;
            player2ScoreElement.classList.add('score-changed');
        }
    }

    function predictBallY() {
        if (gameState.ballSpeedX <= 0) {
            // Ball moving left, return current paddle position
            return gameState.player2Y + PADDLE_HEIGHT / 2;
        }

        // Calculate time for ball to reach paddle
        const distanceToRightPaddle = CANVAS_WIDTH - PADDLE_WIDTH - gameState.ballX;
        const timeToReachPaddle = distanceToRightPaddle / Math.abs(gameState.ballSpeedX);
        
        // Calculate predicted Y position
        let predictedY = gameState.ballY + (gameState.ballSpeedY * timeToReachPaddle);
        
        // Account for bounces
        while (predictedY < 0 || predictedY > CANVAS_HEIGHT) {
            if (predictedY < 0) {
                predictedY = -predictedY;
            } else if (predictedY > CANVAS_HEIGHT) {
                predictedY = 2 * CANVAS_HEIGHT - predictedY;
            }
        }
        
        // Add some randomness to make AI beatable
        predictedY += (Math.random() - 0.5) * AI_PREDICTION_ERROR;
        
        return predictedY;
    }

    function updateAIPaddle() {
        const currentTime = Date.now();
        if (currentTime - gameState.lastAIUpdate < AI_REACTION_TIME) {
            return;
        }
        gameState.lastAIUpdate = currentTime;

        const predictedBallY = predictBallY();
        const paddleCenter = gameState.player2Y + PADDLE_HEIGHT / 2;
        
        // Move paddle towards predicted position
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

        // Move player 1 (human)
        if (keys.w && gameState.player1Y > 0) {
            gameState.player1Y -= PADDLE_SPEED;
        }
        if (keys.s && gameState.player1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            gameState.player1Y += PADDLE_SPEED;
        }

        // Move player 2 (AI)
        if (!gameState.isPaused && !gameState.isGameOver) {
            updateAIPaddle();
        }
    }

    function moveBall() {
        gameState.ballX += gameState.ballSpeedX;
        gameState.ballY += gameState.ballSpeedY;
        
        if (gameState.ballY <= BALL_SIZE / 2 || gameState.ballY >= CANVAS_HEIGHT - BALL_SIZE / 2) {
            gameState.ballSpeedY = -gameState.ballSpeedY;
            
            if (gameState.ballY <= BALL_SIZE / 2) {
                gameState.ballY = BALL_SIZE / 2;
            } else {
                gameState.ballY = CANVAS_HEIGHT - BALL_SIZE / 2;
            }
        }
        
        if (checkPaddleCollision()) {
            // Ball direction has been changed in the collision function
        }
        
        if (gameState.ballX < 0) {
            gameState.player2Score++;
            updateScore(2);
            resetBall();
            checkWinner();
        } else if (gameState.ballX > CANVAS_WIDTH) {
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
            
            const hitPosition = (gameState.ballY - (gameState.player1Y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT;
            
            gameState.ballSpeedX = Math.abs(gameState.ballSpeedX) * gameState.currentSpeedMultiplier;
            gameState.ballSpeedY += hitPosition * 5;
            
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            
            gameState.ballX = PADDLE_WIDTH + BALL_SIZE / 2;
            
            gameState.player1HitEffect = Date.now();
            
            return true;
        }
        
        // Right paddle collision
        if (gameState.ballX + BALL_SIZE / 2 >= CANVAS_WIDTH - PADDLE_WIDTH && 
            gameState.ballY >= gameState.player2Y && 
            gameState.ballY <= gameState.player2Y + PADDLE_HEIGHT) {
            
            const hitPosition = (gameState.ballY - (gameState.player2Y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT;
            
            gameState.ballSpeedX = -Math.abs(gameState.ballSpeedX) * gameState.currentSpeedMultiplier;
            gameState.ballSpeedY += hitPosition * 5;
            
            gameState.currentSpeedMultiplier = Math.min(gameState.currentSpeedMultiplier * SPEED_INCREASE, MAX_BALL_SPEED / BALL_SPEED);
            
            gameState.ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2;
            
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
        gameState.isPaused = true;
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
        
        const winner = gameState.player1Score > gameState.player2Score ? 'You' : 'AI';
        title.textContent = `${winner} Win!`;
        message.textContent = `Congratulations ${winner}!`;
        score.textContent = `${gameState.player1Score} - ${gameState.player2Score}`;
        
        overlay.style.display = 'flex';
    }

    function closeVictoryOverlay() {
        const overlay = document.getElementById('victory-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            resetGame();
        }
    }

    function drawPaddleTrail(trail, x, color, isRightPaddle) {
        ctx.save();
        for (let i = 0; i < trail.length; i++) {
            const alpha = (1 - i / trail.length) * 0.3;
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(x, trail[i], PADDLE_WIDTH, PADDLE_HEIGHT);
        }
        ctx.restore();
    }

    function drawPaddle(x, y, width, height, isRightPaddle) {
        ctx.beginPath();
        const radius = 4;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawPaddleHitEffect(player) {
        const hitTime = player === 1 ? gameState.player1HitEffect : gameState.player2HitEffect;
        if (hitTime && Date.now() - hitTime < HIT_EFFECT_DURATION) {
            const progress = (Date.now() - hitTime) / HIT_EFFECT_DURATION;
            const alpha = 1 - progress;
            const x = player === 1 ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
            const y = player === 1 ? gameState.player1Y : gameState.player2Y;
            
            ctx.save();
            ctx.strokeStyle = player === 1 ? '#00ffff' : '#ff00ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.rect(x - progress * 10, y - progress * 10, 
                    PADDLE_WIDTH + progress * 20, PADDLE_HEIGHT + progress * 20);
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawBall() {
        ctx.save();
        
        const time = Date.now() / 1000;
        const pulseIntensity = Math.sin(time * 2) * 0.1 + 0.9;
        
        ctx.shadowColor = 'rgba(200, 230, 255, 0.8)';
        ctx.shadowBlur = 15 + Math.sin(time * 3) * 3;
        
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
        
        ctx.globalAlpha = 1;
        ctx.fillStyle = snowGradient;
        ctx.beginPath();
        ctx.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        const highlightCount = 8;
        for (let i = 0; i < highlightCount; i++) {
            const angle = (Math.PI * 2 * i) / highlightCount + time * 0.2;
            const distance = BALL_SIZE / 4 * (0.3 + Math.sin(time * 2 + i) * 0.1);
            
            const x = gameState.ballX + Math.cos(angle) * distance;
            const y = gameState.ballY + Math.sin(angle) * distance;
            
            const highlightSize = (BALL_SIZE / 10) * (0.8 + Math.sin(time * 3 + i) * 0.2);
            ctx.globalAlpha = 0.7 * pulseIntensity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, highlightSize, 0, Math.PI * 2);
            ctx.fill();
        }

        const sparkleCount = 4;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleAngle = time * 3 + (Math.PI * 2 * i) / sparkleCount;
            const sparkleDistance = BALL_SIZE / 3 * (0.5 + Math.sin(time * 4 + i) * 0.2);
            
            const sx = gameState.ballX + Math.cos(sparkleAngle) * sparkleDistance;
            const sy = gameState.ballY + Math.sin(sparkleAngle) * sparkleDistance;
            
            ctx.globalAlpha = 0.6 * pulseIntensity;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            
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
        
        ctx.restore();
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
        
        // Draw left paddle
        ctx.save();
        const leftPaddleGradient = ctx.createLinearGradient(0, gameState.player1Y, PADDLE_WIDTH * 2, gameState.player1Y + PADDLE_HEIGHT);
        leftPaddleGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        leftPaddleGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.9)');
        leftPaddleGradient.addColorStop(1, 'rgba(0, 150, 255, 0.8)');

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = leftPaddleGradient;
        drawPaddle(0, gameState.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT, false);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw right paddle
        ctx.save();
        const rightPaddleGradient = ctx.createLinearGradient(CANVAS_WIDTH - PADDLE_WIDTH * 2, gameState.player2Y, CANVAS_WIDTH, gameState.player2Y + PADDLE_HEIGHT);
        rightPaddleGradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        rightPaddleGradient.addColorStop(0.5, 'rgba(255, 0, 200, 0.9)');
        rightPaddleGradient.addColorStop(1, 'rgba(255, 0, 150, 0.8)');

        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = rightPaddleGradient;
        drawPaddle(CANVAS_WIDTH - PADDLE_WIDTH, gameState.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT, true);
        ctx.fill();
        
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

    function gameLoop() {
        console.log('Game loop running');
        if (!gameState.isPaused && !gameState.isGameOver) {
            movePaddles();
            moveBall();
        }
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    startButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetGame);

    // Initialize the game
    console.log('Starting game initialization...');
    resetGame();
    draw(); // Initial draw to ensure something is visible
    gameLoop();
    console.log('Game initialized!');
}); 