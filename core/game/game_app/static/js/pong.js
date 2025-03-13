// Get canvas and context
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Make canvas focusable and give it focus
canvas.tabIndex = 1;
canvas.focus();

// Game state
let gameState = {
    ball_x: 50,
    ball_y: 50,
    ball_dx: 3.0,  // Match server's initial speed
    ball_dy: 3.0,  // Match server's initial speed
    player1_position: 50,
    player2_position: 50,
    player1_score: 0,
    player2_score: 0,
    is_full: false
};

// Client info
let clientId = null;
let isPlayer1 = false;
let isPlayer2 = false;

// Update the constants for better performance
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH = 2;
const BALL_SIZE = 2;
const PADDLE_SPEED = 8;
const MOVEMENT_SMOOTHING = 0.7; // Increased for more responsive movement
const RENDER_INTERVAL = 1000 / 60; // Target 60 FPS

// Auto paddle movement configuration
let AUTO_PADDLE_SPEED = 0.5; // Speed of automatic paddle movement (percentage per frame)
let paddle1Direction = 1; // 1 for down, -1 for up
let paddle2Direction = -1; // Start in opposite direction
let autoMovementEnabled = true; // Can be toggled via settings if desired
let animationId = null; // Store the animation frame ID

// Get room name from URL or generate one
const urlParams = new URLSearchParams(window.location.search);
const roomName = urlParams.get('room') || Math.random().toString(36).substring(2, 8);

// Update URL if needed
if (!urlParams.has('room')) {
    window.history.replaceState({}, '', `?room=${roomName}`);
}

// Create WebSocket connection
const socket = new WebSocket(`ws://${window.location.host}/ws/game/${roomName}/`);
let isRejectedDueToFullRoom = false;  // Flag to track if we've been rejected

socket.onopen = function() {
    console.log("Connected to WebSocket");
    document.getElementById("game-status").innerText = "Connecting to game...";
};

// Add pause state variables
let isPaused = false;
let isGameStarted = false;
const pauseButton = document.getElementById('pauseButton');
let pausedByClientId = null;
let pauseTimer = null;
const PAUSE_TIMEOUT = 30; // 30 seconds
let remainingPauseTime = PAUSE_TIMEOUT;

// Remove any existing click handlers and add this new one
pauseButton.onclick = null;
pauseButton.addEventListener('click', function(e) {
    console.log('Pause button clicked', { isPaused, pausedByClientId, clientId, isPlayer1, isPlayer2 });
    
    // If the game is not paused, anyone can pause
    if (!isPaused) {
        togglePause();
        return;
    }
    
    // If the game is paused, only the player who paused can resume it
    if (clientId !== pausedByClientId) {
        console.log("Cannot resume - only the player who paused can resume!");
        e.preventDefault();
        return false;
    }
    
    // If we got here, the player is allowed to resume
    togglePause();
});

// Enhanced WebSocket sending function with logging
function sendWsMessage(message) {
    console.log("Sending WebSocket message:", message);
    socket.send(JSON.stringify(message));
}

// Add these variables at the top with other game state variables
let lastTime = 0;
let animationFrameId = null;

// Add these variables for optimized rendering
let lastRenderTime = 0;
let accumulatedTime = 0;
let isRendering = false;

// Add a predicted state object for smooth client-side movement
let predictedState = {
    player1_position: 50,
    player2_position: 50
};

// Update the drawGame function to use predicted positions
function drawGame(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Skip frame if too much time has passed
    if (deltaTime > 100) {
        requestNextFrame();
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pre-calculate all dimensions once
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const paddleWidth = (PADDLE_WIDTH / 100) * canvasWidth;
    const paddleHeight = (PADDLE_HEIGHT / 100) * canvasHeight;
    const ballSize = (BALL_SIZE / 100) * Math.min(canvasWidth, canvasHeight);
    
    // Use predicted positions for the current player's paddle
    let p1Y, p2Y;
    if (isPlayer1) {
        p1Y = (predictedState.player1_position / 100) * canvasHeight;
        p2Y = (gameState.player2_position / 100) * canvasHeight;
    } else if (isPlayer2) {
        p1Y = (gameState.player1_position / 100) * canvasHeight;
        p2Y = (predictedState.player2_position / 100) * canvasHeight;
    } else {
        // For spectators, use the server state
        p1Y = (gameState.player1_position / 100) * canvasHeight;
        p2Y = (gameState.player2_position / 100) * canvasHeight;
    }
    
    // Pre-calculate ball position
    const ballX = (gameState.ball_x / 100) * canvasWidth;
    const ballY = (gameState.ball_y / 100) * canvasHeight;
    
    // Draw paddles with enhanced rendering
    // Create gradient for Player 1 paddle
    const p1Gradient = ctx.createLinearGradient(0, p1Y - paddleHeight/2, paddleWidth * 2, p1Y + paddleHeight/2);
    p1Gradient.addColorStop(0, "rgba(12, 53, 158, 0.9)");
    p1Gradient.addColorStop(0.5, "rgba(20, 71, 207, 1)");
    p1Gradient.addColorStop(1, "rgba(12, 53, 158, 0.9)");

    // Create gradient for Player 2 paddle
    const p2Gradient = ctx.createLinearGradient(canvasWidth - paddleWidth * 2, p2Y - paddleHeight/2, canvasWidth, p2Y + paddleHeight/2);
    p2Gradient.addColorStop(0, "rgba(75, 123, 255, 0.9)");
    p2Gradient.addColorStop(0.5, "rgba(75, 123, 255, 1)");
    p2Gradient.addColorStop(1, "rgba(75, 123, 255, 0.9)");

    // Draw paddles with inner glow
    ctx.shadowBlur = 15;
    
    // Draw left paddle (Player 1) with rounded corners
    ctx.shadowColor = "#0C359E";
    ctx.fillStyle = p1Gradient;
    ctx.beginPath();
    ctx.roundRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight, [0, 4, 4, 0]);
    ctx.fill();

    // Add inner highlight to left paddle
    ctx.fillStyle = "rgba(75, 123, 255, 0.3)";
    ctx.beginPath();
    ctx.roundRect(paddleWidth * 0.2, p1Y - paddleHeight/2 + 2, paddleWidth * 0.3, paddleHeight - 4, [0, 2, 2, 0]);
    ctx.fill();
    
    // Draw right paddle (Player 2) with rounded corners
    ctx.shadowColor = "#4B7BFF";
    ctx.fillStyle = p2Gradient;
    ctx.beginPath();
    ctx.roundRect(canvasWidth - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight, [4, 0, 0, 4]);
    ctx.fill();

    // Add inner highlight to right paddle
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.roundRect(canvasWidth - paddleWidth * 0.5, p2Y - paddleHeight/2 + 2, paddleWidth * 0.3, paddleHeight - 4, [2, 0, 0, 2]);
    ctx.fill();
    
    // Reset shadow for other elements
    ctx.shadowBlur = 0;
    
    // Add paddle hit animation when ball collides
    if (gameState.ball_x <= PADDLE_WIDTH * 2 && 
        gameState.ball_y >= gameState.player1_position - PADDLE_HEIGHT/2 && 
        gameState.ball_y <= gameState.player1_position + PADDLE_HEIGHT/2) {
        // Player 1 paddle hit animation with enhanced effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#0C359E";
        ctx.fillStyle = "rgba(20, 71, 207, 1)";
        ctx.beginPath();
        ctx.roundRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight, [0, 4, 4, 0]);
        ctx.fill();
        
        // Add hit flash effect
        ctx.fillStyle = "rgba(75, 123, 255, 0.5)";
        ctx.beginPath();
        ctx.roundRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight, [0, 4, 4, 0]);
        ctx.fill();
    }
    
    if (gameState.ball_x >= canvasWidth - PADDLE_WIDTH * 2 && 
        gameState.ball_y >= gameState.player2_position - PADDLE_HEIGHT/2 && 
        gameState.ball_y <= gameState.player2_position + PADDLE_HEIGHT/2) {
        // Player 2 paddle hit animation with enhanced effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#4B7BFF";
        ctx.fillStyle = "rgba(75, 123, 255, 1)";
        ctx.beginPath();
        ctx.roundRect(canvasWidth - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight, [4, 0, 0, 4]);
        ctx.fill();
        
        // Add hit flash effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.roundRect(canvasWidth - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight, [4, 0, 0, 4]);
        ctx.fill();
    }
    
    // Reset shadow for ball
    ctx.shadowBlur = 0;
    
    // Optimize ball trail effect
    const currentSpeed = Math.sqrt(gameState.ball_dx * gameState.ball_dx + gameState.ball_dy * gameState.ball_dy);
    if (currentSpeed > 3) {
        const trailLength = Math.min(currentSpeed * 1.2, 3);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#4B7BFF";
        ctx.beginPath();
        ctx.arc(ballX - (gameState.ball_dx * trailLength), ballY - (gameState.ball_dy * trailLength), ballSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Draw main ball with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#4B7BFF";
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw center line with glow
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#0C359E";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.strokeStyle = "rgba(12, 53, 158, 0.5)";
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Request next animation frame, but only if the game isn't paused
    if (!isPaused && isGameStarted) {
        requestNextFrame();
    } else {
        console.log("Not requesting next frame at end of drawGame - isPaused:", isPaused);
    }
}

// Add this new function for optimized frame requesting
function requestNextFrame() {
    // Only request animation frame if the game is running (not paused and started)
    if (!isPaused && isGameStarted) {
        // For safety, always check if there's an existing animation frame and cancel it
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Request a new animation frame
        try {
            animationFrameId = window.requestAnimationFrame(drawGame);
        } catch (error) {
            console.error("Error requesting animation frame:", error);
            
            // Fallback - try again after a short delay
            setTimeout(() => {
                if (!isPaused && isGameStarted && !animationFrameId) {
                    console.log("Retrying animation frame request");
                    animationFrameId = window.requestAnimationFrame(drawGame);
                }
            }, 16); // ~ 60fps
        }
    } else {
        if (isPaused) {
            console.log("Not requesting animation frame - game is paused");
        }
        if (!isGameStarted) {
            console.log("Not requesting animation frame - game not started");
        }
    }
}

// Update the updateGameState function to reconcile server state with predicted state
function updateGameState(state) {
    // Check for score changes and animate if needed
    if (gameState.player1_score !== state.player1_score || gameState.player2_score !== state.player2_score) {
        updateScoreWithAnimation(gameState.player1_score, state.player1_score, gameState.player2_score, state.player2_score);
    }
    
    // Update the game state from server
    gameState = state;
    
    // Check if the game is now full
    if (state.is_full && !isGameStarted) {
        console.log("Game is now full from updateGameState");
        isGameStarted = true;
        
        // Update UI elements
        pauseButton.disabled = false;
        updatePauseButtonState();
        updateGameStatus();
        
        // Start animation if not already running and not paused
        if (!isPaused && !animationFrameId) {
            console.log("Starting animation from updateGameState");
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(drawGame);
        }
    }
    
    // Also update our predicted state based on server's authoritative state
    if (isPlayer1) {
        // If we're player 1, update our prediction's player 2 position
        predictedState.player2_position = state.player2_position;
        
        // Gently reconcile our predicted position with server's position to avoid jumps
        const diff = state.player1_position - predictedState.player1_position;
        if (Math.abs(diff) > 5) {
            // If too far off, snap to server position
            predictedState.player1_position = state.player1_position;
        } else if (Math.abs(diff) > 0.1) {
            // Otherwise slowly correct
            predictedState.player1_position += diff * 0.3;
        }
    } else if (isPlayer2) {
        // If we're player 2, update our prediction's player 1 position
        predictedState.player1_position = state.player1_position;
        
        // Gently reconcile our predicted position with server's position
        const diff = state.player2_position - predictedState.player2_position;
        if (Math.abs(diff) > 5) {
            // If too far off, snap to server position
            predictedState.player2_position = state.player2_position;
        } else if (Math.abs(diff) > 0.1) {
            // Otherwise slowly correct
            predictedState.player2_position += diff * 0.3;
        }
    } else {
        // For spectators, just use the server state
        predictedState.player1_position = state.player1_position;
        predictedState.player2_position = state.player2_position;
    }
    
    // Determine if we're player1 or player2
    if (!isPlayer1 && !isPlayer2) {
        if (clientId && state.player1_id === clientId) {
            console.log("I am Player 1");
            isPlayer1 = true;
            isPlayer2 = false;
            // Initialize predicted position
            predictedState.player1_position = state.player1_position;
        } else if (clientId && state.player2_id === clientId) {
            console.log("I am Player 2");
            isPlayer1 = false;
            isPlayer2 = true;
            // Initialize predicted position
            predictedState.player2_position = state.player2_position;
        }
    }
    
    // Update status
    const statusElement = document.getElementById("game-status");
    if (!state.is_full) {
        statusElement.innerText = "Waiting for opponent...";
        statusElement.classList.remove('error', 'success');
        pauseButton.disabled = true;
    } else if (state.winner_id) {
        // This will be handled by the game_over event
        pauseButton.disabled = true;
    } else {
        if (!isPaused) {
            statusElement.innerText = "Game in progress";
            statusElement.classList.remove('error');
            statusElement.classList.add('success');
        }
        pauseButton.disabled = false;
    }
    
    // Update score
    document.getElementById("player1-score").innerText = state.player1_score;
    document.getElementById("player2-score").innerText = state.player2_score;
    
    // Start animation if not already running
    if (!animationFrameId && !isPaused && isGameStarted) {
        animationFrameId = requestAnimationFrame(drawGame);
    }
}

socket.onmessage = function(event) {
    let data;
    try {
        data = JSON.parse(event.data);
        console.log("Received message:", data);
        
        // EMERGENCY HANDLING: Process player_disconnected immediately with highest priority
        if (data.type === 'player_disconnected') {
            console.log("🚨 EMERGENCY: Player disconnection detected!");
            // Handle immediately
            handlePlayerDisconnected(data);
            
            // Don't process any other message types
            return;
        }
        
        // Handle other message types
        switch(data.type) {
            case "game_state":
                if (data.client_id) {
                    clientId = data.client_id;
                }
                console.log("Updating game state:", data.state.player1_position, data.state.player2_position);
                updateGameState(data.state);
                
                // Enable pause button when game starts
                if (!isGameStarted && data.state.is_full) {
                    console.log("Game is now full and ready to start");
                    isGameStarted = true;
                    pauseButton.disabled = false;
                    
                    // Start the animation if not paused and not already running
                    if (!isPaused && !animationFrameId) {
                        console.log("Starting initial animation frame");
                        lastTime = performance.now();
                        animationFrameId = requestAnimationFrame(drawGame);
                    }
                } 
                break;

            case 'room_full':
                // Handle the case when the room is full
                handleRoomFull(data);
                break;
                
            case 'player_joined':
                handlePlayerJoined(data);
                break;
                
            case 'chat':
                handleChatMessage(data);
                break;
                
            case 'game_over':
                handleGameOver(data);
                break;
                
            case 'game_paused':
                handleGamePaused(data);
                break;
                
            default:
                console.log("Unknown message type:", data.type);
                break;
        }
    } catch (error) {
        console.error("Error processing WebSocket message:", error, event.data);
    }
};

socket.onclose = function(event) {
    console.log("WebSocket closed with code:", event.code);
    
    // Avoid updating status if we were already shown the room full message
    if (isRejectedDueToFullRoom || document.getElementById("room-full-message")) {
        return;
    }
    
    // Only show connection lost if we were actually connected before
    if (clientId) {
        const statusElement = document.getElementById("game-status");
        statusElement.innerText = "Connection lost. Please refresh.";
        statusElement.classList.remove('success');
        statusElement.classList.add('error');
        
        // Cleanup any running animations or timers
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        clearPauseTimer();
    }
};

socket.onerror = function(error) {
    console.error("WebSocket error:", error);
    
    // Avoid updating status if we were already shown the room full message
    if (isRejectedDueToFullRoom || document.getElementById("room-full-message")) {
        return;
    }
    
    const statusElement = document.getElementById("game-status");
    statusElement.innerText = "Connection error. Please refresh.";
    statusElement.classList.remove('success');
    statusElement.classList.add('error');
};

// Add focus event for the canvas to make sure keyboard events work
canvas.addEventListener('click', function() {
    console.log("Canvas clicked, setting focus");
    this.focus();
});

window.addEventListener('focus', function() {
    console.log("Window focused");
    canvas.focus();
});

document.addEventListener('click', function(e) {
    console.log("Document clicked");
    // Only focus canvas if the click wasn't on the chat input or its container
    const chatInput = document.getElementById("chat-message");
    const chatButton = document.querySelector(".chat-input button");
    const chatContainer = document.querySelector(".chat-input");
    
    // Skip setting focus if clicking on chat elements
    if (e.target === chatInput || e.target === chatButton || e.target === chatContainer) {
        console.log("Chat element clicked, not changing focus");
        return;
    }
    
    if (document.activeElement !== canvas) {
        console.log("Canvas not focused, setting focus");
        canvas.focus();
    }
});

// Update the keyboard controls for immediate local updates
document.addEventListener('keydown', function(e) {
    // Don't process game controls if typing in chat
    if (document.activeElement === document.getElementById("chat-message")) {
        return; // Let the chat input handle the key event
    }
    
    if (isPaused || (!isPlayer1 && !isPlayer2)) {
        return;
    }
    
    // Determine which paddle we're controlling
    if (isPlayer1) {
        if (e.key.toLowerCase() === 'w') {
            // Update predicted position immediately
            predictedState.player1_position = Math.max(predictedState.player1_position - PADDLE_SPEED, PADDLE_HEIGHT/2);
            
            // Send to server
            sendWsMessage({
                type: 'paddle_move',
                position: predictedState.player1_position
            });
        } else if (e.key.toLowerCase() === 's') {
            // Update predicted position immediately
            predictedState.player1_position = Math.min(predictedState.player1_position + PADDLE_SPEED, 100 - PADDLE_HEIGHT/2);
            
            // Send to server
            sendWsMessage({
                type: 'paddle_move',
                position: predictedState.player1_position
            });
        } else {
            return;
        }
    } else if (isPlayer2) {
        if (e.key.toLowerCase() === 'w') {
            // Update predicted position immediately
            predictedState.player2_position = Math.max(predictedState.player2_position - PADDLE_SPEED, PADDLE_HEIGHT/2);
            
            // Send to server
            sendWsMessage({
                type: 'paddle_move',
                position: predictedState.player2_position
            });
        } else if (e.key.toLowerCase() === 's') {
            // Update predicted position immediately
            predictedState.player2_position = Math.min(predictedState.player2_position + PADDLE_SPEED, 100 - PADDLE_HEIGHT/2);
            
            // Send to server
            sendWsMessage({
                type: 'paddle_move',
                position: predictedState.player2_position
            });
        } else {
            return;
        }
    }
    
    // Force immediate redraw with predicted positions
    if (!isRendering) {
        isRendering = true;
        drawGame(performance.now());
        isRendering = false;
    }
});

// Function to handle a player joining
function handlePlayerJoined(data) {
    console.log("Player joined:", data.client_id);
    // Update game state
    if (data.state) {
        updateGameState(data.state);
    }
    
    // Add chat message as a system message
    const chatBox = document.getElementById("chat-box");
    const isMe = data.client_id === clientId;
    const messageHTML = `
        <div class="chat-message system">
            <div class="content"><strong>${isMe ? 'You' : 'Opponent'}</strong> joined the game</div>
            <div class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    chatBox.innerHTML += messageHTML;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle chat messages
function handleChatMessage(data) {
    const isMe = data.client_id === clientId;
    const chatBox = document.getElementById("chat-box");
    
    // Create a formatted time string
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Create the chat message with proper styling
    const messageHTML = `
        <div class="chat-message ${isMe ? 'self' : 'other'}">
            <div class="sender">${isMe ? 'You' : 'Opponent'}</div>
            <div class="content">${escapeHTML(data.message)}</div>
            <div class="time">${time}</div>
        </div>
    `;
    
    chatBox.innerHTML += messageHTML;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Helper function to escape HTML to prevent XSS
function escapeHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to create confetti particles
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    confettiContainer.innerHTML = '';
    
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#a29bfe', '#ffeaa7', '#fd79a8'];
    const totalConfetti = 100;
    
    for (let i = 0; i < totalConfetti; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);
    }
}

// Function to create floating particles
function createParticles() {
    const confettiContainer = document.querySelector('.confetti-container');
    const totalParticles = 50;
    
    for (let i = 0; i < totalParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
        particle.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`);
        particle.style.animationDelay = Math.random() * 2 + 's';
        confettiContainer.appendChild(particle);
    }
}

// Function to show victory animation
function showVictoryAnimation(message, finalScore) {
    const overlay = document.getElementById('victory-overlay');
    const title = overlay.querySelector('.victory-title');
    const scoreElement = overlay.querySelector('#final-score');
    const messageElement = overlay.querySelector('.victory-message');
    const button = overlay.querySelector('.victory-button');
    
    // Clear any existing classes and timeouts
    overlay.classList.remove('active', 'game-over');
    
    // Determine if it's a victory or game over
    const isVictory = message === "You win!";
    
    // Set the appropriate class before showing the overlay
    if (!isVictory) {
        // Small delay to ensure game-over class is applied before showing
        setTimeout(() => {
            overlay.classList.add('game-over');
            // Then add active class
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        }, 50);
    } else {
        overlay.classList.add('active');
    }
    
    // Update content
    title.textContent = isVictory ? "Victory!" : "Game Over";
    messageElement.textContent = message;
    scoreElement.textContent = finalScore;
    button.textContent = isVictory ? "Play Again" : "Try Again";
    
    // Only show confetti for victory
    if (isVictory) {
        createConfetti();
        createParticles();
    }
    
    // Set timeout to remove the overlay
    setTimeout(() => {
        overlay.classList.remove('active');
        // Add a delay before removing game-over class
        setTimeout(() => {
            overlay.classList.remove('game-over');
            // Clean up particles
            const confettiContainer = document.querySelector('.confetti-container');
            if (confettiContainer) {
                confettiContainer.innerHTML = '';
            }
        }, 500); // Wait for fade out transition to complete
    }, 5000);
}

// Function to close victory overlay
function closeVictoryOverlay() {
    const overlay = document.getElementById('victory-overlay');
    
    // Remove active class first
    overlay.classList.remove('active');
    
    // Wait for fade out transition before removing game-over class
    setTimeout(() => {
        overlay.classList.remove('game-over');
        // Clean up particles
        const confettiContainer = document.querySelector('.confetti-container');
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }
    }, 500);
}

// Update the handleGameOver function to include victory animation
function handleGameOver(data) {
    const winnerId = data.winner_id;
    let message = "";
    let statusClass = "";
    
    // Check if we're the winner
    if (isPlayer1 && winnerId === gameState.player1_id || 
        isPlayer2 && winnerId === gameState.player2_id) {
        message = "You win!";
        statusClass = "success";
    } else {
        message = "You lose!";
        statusClass = "error";
    }
    
    // For spectators or if winner logic fails
    if (!isPlayer1 && !isPlayer2) {
        if (winnerId === gameState.player1_id) {
            message = "Player 1 wins!";
            statusClass = "success";
        } else {
            message = "Player 2 wins!";
            statusClass = "success";
        }
    }
    
    // Get final score
    const finalScore = `${gameState.player1_score} - ${gameState.player2_score}`;
    
    // Show victory animation
    showVictoryAnimation(message, finalScore);
    
    // Update game status with appropriate color
    const statusElement = document.getElementById("game-status");
    statusElement.innerText = message;
    statusElement.classList.remove('error', 'success');
    statusElement.classList.add(statusClass);
    
    // Add chat message as a system message with special styling
    const chatBox = document.getElementById("chat-box");
    const messageHTML = `
        <div class="chat-message system" style="font-weight: bold; background-color: ${
            message === "You win!" ? "rgba(52, 199, 89, 0.2)" : 
            message === "You lose!" ? "rgba(255, 59, 48, 0.2)" : "rgba(255, 255, 255, 0.15)"
        }; border-left-color: ${
            message === "You win!" ? "var(--success-color)" : 
            message === "You lose!" ? "var(--danger-color)" : "rgba(255, 255, 255, 0.3)"
        };">
            <div class="content"><strong>Game Over:</strong> ${message}</div>
            <div class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    chatBox.innerHTML += messageHTML;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to send chat messages
function sendChatMessage() {
    const input = document.getElementById("chat-message");
    const message = input.value.trim();
    
    if (message) {
        // Send to server
        sendWsMessage({
            type: 'chat',
            message: message
        });
        
        // Clear input
        input.value = "";
        
        // Re-focus on input for continued typing
        input.focus();
    }
}

// Allow Enter key to send chat messages
document.getElementById("chat-message").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        sendChatMessage();
    }
});

// Add specific handler for the chat input to prevent issues with focus
document.getElementById("chat-message").addEventListener("click", function(e) {
    // Stop event propagation to prevent document click handler from firing
    e.stopPropagation();
});

document.getElementById("chat-message").addEventListener("focus", function(e) {
    // Prevent the canvas focus code from interfering
    e.stopPropagation();
    console.log("Chat input focused");
});

// Also make sure the send button doesn't cause focus issues
document.querySelector(".chat-input button").addEventListener("click", function(e) {
    e.stopPropagation();
});

function startPauseTimer() {
    remainingPauseTime = PAUSE_TIMEOUT;
    updatePauseButtonState();

    if (pauseTimer) {
        clearInterval(pauseTimer);
        pauseTimer = null;
    }

    pauseTimer = setInterval(() => {
        remainingPauseTime--;
        updatePauseButtonState();
        updateGameStatus();

        // When timer reaches zero, auto-resume regardless of who paused
        if (remainingPauseTime <= 0) {
            clearInterval(pauseTimer);
            pauseTimer = null;
            
            // Only auto-resume if the game is still paused
            if (isPaused) {
                // Store who paused for logging
                const pausedBy = pausedByClientId;
                
                // Reset paused state
                isPaused = false;
                pausedByClientId = null;
                
                // Send auto-resume message to server
                sendWsMessage({
                    type: 'toggle_pause',
                    paused: false,
                    pausedByClientId: pausedBy,
                    resumedByClientId: 'auto',
                    remainingTime: 0,
                    autoResumed: true
                });
                
                console.log(`Game auto-resumed after 30s timeout (originally paused by ${pausedBy})`);
                
                // Start animation again
                if (!animationFrameId && isGameStarted) {
                    animationFrameId = requestAnimationFrame(drawGame);
                }
                
                // Update UI
                updatePauseButtonState();
                updateGameStatus();
            }
        }
    }, 1000);
}

function clearPauseTimer() {
    if (pauseTimer) {
        clearInterval(pauseTimer);
        pauseTimer = null;
    }
    remainingPauseTime = PAUSE_TIMEOUT;
}

function updatePauseButtonState() {
    console.log('Updating button state', { isPaused, pausedByClientId, clientId, isPlayer1, isPlayer2 });
    
    if (!isGameStarted) {
        pauseButton.disabled = true;
        pauseButton.textContent = 'Pause Game';
        pauseButton.style.cursor = 'not-allowed';
        return;
    }

    if (isPaused) {
        // Show resume button only for the player who paused
        if (clientId === pausedByClientId) {
            pauseButton.textContent = `Resume Game (${remainingPauseTime}s)`;
            pauseButton.disabled = false;
            pauseButton.style.cursor = 'pointer';
        } else {
            // For other players, show countdown but disable the button
            pauseButton.textContent = `Resuming in ${remainingPauseTime}s`;
            pauseButton.disabled = true;
            pauseButton.style.cursor = 'not-allowed';
        }
        pauseButton.classList.add('paused');
    } else {
        pauseButton.textContent = 'Pause Game';
        pauseButton.classList.remove('paused');
        pauseButton.disabled = false;
        pauseButton.style.cursor = 'pointer';
    }
}

function updateGameStatus(customStatus) {
    const statusElement = document.getElementById("game-status");
    
    // If a custom status is provided, use it
    if (customStatus) {
        statusElement.innerText = customStatus;
        return;
    }
    
    // Check if opponent has disconnected (using the global flag we set)
    if (window.opponentDisconnected) {
        statusElement.innerText = "OPPONENT DISCONNECTED - GAME ENDED";
        statusElement.style.color = "#f44336";
        statusElement.style.fontWeight = "bold";
        return;
    }
    
    // Normal game status logic
    if (isPaused) {
        if (clientId === pausedByClientId) {
            statusElement.innerText = `You paused the game. Click 'Resume' or wait ${remainingPauseTime}s for auto-resume.`;
        } else {
            statusElement.innerText = `Game paused by opponent. Resuming in ${remainingPauseTime}s...`;
        }
    } else {
        statusElement.innerText = isGameStarted ? "Game in progress" : "Waiting for opponent...";
    }
}

// Add cleanup for animation frame
function cleanup() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    clearPauseTimer();
}

// Update the window unload event listener
window.addEventListener('beforeunload', cleanup);

// Update the pause handling
function togglePause() {
    console.log('togglePause called with state:', { 
        isPaused, 
        pausedByClientId, 
        clientId, 
        isGameStarted,
        animationFrameId
    });
    
    // When trying to resume, only the player who paused can do it
    if (isPaused && clientId !== pausedByClientId) {
        console.log("Only the client who paused can resume!");
        return;
    }

    // Store the previous state before toggling
    const wasPaused = isPaused;
    
    // Toggle the pause state
    isPaused = !isPaused;
    console.log(`Pause state changed from ${wasPaused} to ${isPaused}`);

    // Store who is executing this action (for both pause and resume)
    const actionByClientId = clientId;

    if (isPaused) {
        // Game is being paused
        console.log(`Pausing game. Current animationFrameId: ${animationFrameId}`);
        
        // Cancel any running animation frame
        if (animationFrameId) {
            console.log(`Cancelling animation frame: ${animationFrameId}`);
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Record who paused the game
        pausedByClientId = actionByClientId;
        startPauseTimer();
    } else {
        // Game is being resumed
        console.log(`Resuming game by ${actionByClientId}. Current animationFrameId: ${animationFrameId}`);
        
        // Clear the timer
        clearPauseTimer();
        
        // DO NOT clear pausedByClientId before sending the message to the server
        // so that the server knows who resumed the game
        
        // Force restart the animation frame
        // Always cancel any existing frames first to be safe
        if (animationFrameId) {
            console.log(`Cancelling any existing animation frame: ${animationFrameId}`);
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        if (isGameStarted) {
            console.log("Restarting animation frame on resume");
            // Use setTimeout to ensure the animation restarts after the current execution stack
            setTimeout(() => {
                lastTime = performance.now();
                console.log("Starting new animation frame");
                animationFrameId = window.requestAnimationFrame(drawGame);
                console.log(`New animation frame ID: ${animationFrameId}`);
            }, 0);
        }
    }

    // Send the pause state to the server
    console.log(`Sending pause state to server: ${isPaused}, action by: ${actionByClientId}`);
    sendWsMessage({
        type: 'toggle_pause',
        paused: isPaused,
        pausedByClientId: isPaused ? actionByClientId : pausedByClientId, // Who paused
        resumedByClientId: isPaused ? null : actionByClientId, // Who resumed (only set if resuming)
        remainingTime: remainingPauseTime
    });

    // Now that we've sent the message, we can clear pausedByClientId if resuming
    if (!isPaused) {
        pausedByClientId = null;
    }

    // Update UI
    updatePauseButtonState();
    updateGameStatus();
    
    console.log(`Toggle pause complete. Game is now ${isPaused ? 'paused' : 'resumed'}. Animation frame ID: ${animationFrameId}`);
}

// Start the game loop
if (isGameStarted && !isPaused) {
    animationFrameId = requestAnimationFrame(drawGame);
}

// Function to handle room full message
function handleRoomFull(data) {
    console.log("Room is full:", data.message);
    
    // Set the flag indicating we were rejected due to full room
    isRejectedDueToFullRoom = true;
    
    // Create a completely new UI instead of modifying existing elements
    // This ensures no interference with the ongoing game
    
    // First, store reference to body
    const body = document.body;
    
    // Clear the entire page content
    body.innerHTML = '';
    
    // Create a new container for the rejected player
    const rejectedContainer = document.createElement("div");
    rejectedContainer.className = "rejected-container";
    rejectedContainer.style.cssText = `
        width: 100%;
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background-color: #1e1e1e;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        text-align: center;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    // Create message content
    rejectedContainer.innerHTML = `
        <h2 style="color: #f44336; margin-bottom: 20px;">Game Room Full</h2>
        <p style="margin-bottom: 20px; font-size: 16px; line-height: 1.5;">${data.message}</p>
        <button id="create-new-room" style="
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        ">Create New Room</button>
    `;
    
    // Add the container to the body
    body.appendChild(rejectedContainer);
    
    // Add event listener to the create room button
    document.getElementById("create-new-room").addEventListener("click", function() {
        // Generate a new random room name
        const newRoomName = Math.random().toString(36).substring(2, 8);
        // Navigate to the new room
        window.location.href = `?room=${newRoomName}`;
    });
    
    // Cancel any animation frames
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Stop any timers
    clearPauseTimer();
    
    console.log("Completely separated UI created for rejected player");
}

// Add a diagnostic function for debugging
function checkGameState() {
    console.log("Game State Diagnostic:");
    console.log("---------------");
    console.log("isPaused:", isPaused);
    console.log("isGameStarted:", isGameStarted);
    console.log("clientId:", clientId);
    console.log("pausedByClientId:", pausedByClientId);
    console.log("isPlayer1:", isPlayer1); 
    console.log("isPlayer2:", isPlayer2);
    console.log("animationFrameId:", animationFrameId);
    console.log("remainingPauseTime:", remainingPauseTime);
    console.log("---------------");
    
    // Check for potential issues
    if (isPaused && !pausedByClientId) {
        console.warn("WARNING: Game is paused but no pausedByClientId is set!");
    }
    
    if (!isPaused && !animationFrameId && isGameStarted) {
        console.warn("WARNING: Game is resumed but no animation frame is active!");
        console.log("Attempting to restart animation...");
        
        // Try to restart animation
        lastTime = performance.now();
        animationFrameId = window.requestAnimationFrame(drawGame);
        console.log("New animation frame ID:", animationFrameId);
    }
    
    return {
        isPaused,
        isGameStarted,
        clientId,
        pausedByClientId,
        isPlayer1,
        isPlayer2,
        animationFrameId,
        remainingPauseTime
    };
}

// Make available globally for console debugging
window.checkGameState = checkGameState;
window.forcePauseResume = function(forcePause) {
    console.log("Manual override - forcing pause state to:", forcePause);
    
    // Force the pause state
    isPaused = forcePause;
    
    if (forcePause) {
        // Force pause
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        pausedByClientId = clientId;
    } else {
        // Force resume
        pausedByClientId = null;
        
        if (isGameStarted && !animationFrameId) {
            console.log("Forcing animation restart");
            lastTime = performance.now();
            animationFrameId = window.requestAnimationFrame(drawGame);
        }
    }
    
    // Update UI
    updatePauseButtonState();
    updateGameStatus();
    
    return checkGameState();
};

// Add disconnection message to chat with proper formatting
function addDisconnectionMessage(message) {
    const chatBox = document.getElementById("chat-box");
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const messageHTML = `
        <div class="chat-message system emergency">
            <div class="content"><strong>⚠️ SYSTEM ALERT:</strong> ${message}</div>
            <div class="time">${time}</div>
        </div>
    `;
    
    chatBox.innerHTML += messageHTML;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle player disconnection - EMERGENCY VERSION
function handlePlayerDisconnected(data) {
    console.log("🔴 PLAYER DISCONNECTED EVENT RECEIVED:", data);
    
    try {
        // EMERGENCY: Stop everything immediately
        // Cancel all animations
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            console.log("Animation canceled");
        }
        
        // Clear all timers
        clearPauseTimer();
        
        // Set all game state flags to stop the game
        window.opponentDisconnected = true;
        isPaused = true;
        isGameStarted = false;
        
        // EMERGENCY: Force clear all intervals that might be running
        // This is a brute force approach to ensure everything stops
        for (let i = 1; i < 10000; i++) {
            window.clearInterval(i);
        }
        
        console.log("Game state forcibly reset");
        
        // Add a message to the chat with timestamp - use our new function
        addDisconnectionMessage(data.message);
        
        try {
            // Remove any existing overlay first
            const existingOverlay = document.getElementById("disconnect-overlay");
            if (existingOverlay) {
                document.body.removeChild(existingOverlay);
            }
            
            // Create new overlay
            const overlay = document.createElement("div");
            overlay.id = "disconnect-overlay";
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                animation: fadeIn 0.5s ease-in-out;
            `;
            
            // Create message container with vibrant styling
            const messageContainer = document.createElement("div");
            messageContainer.style.cssText = `
                background-color: #ff3b30;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 50px rgba(255, 59, 48, 0.8);
                max-width: 80%;
                margin-bottom: 30px;
                animation: pulse 1.5s infinite alternate;
            `;
            
            // Add disconnect message with warning icon
            messageContainer.innerHTML = `
                <h1 style="font-size: 36px; margin-bottom: 20px; text-transform: uppercase; color: white;">
                    ⚠️ CONNECTION LOST ⚠️
                </h1>
                <h2 style="font-size: 24px; margin-bottom: 20px; color: white;">
                    ${data.player_label} has disconnected
                </h2>
                <p style="font-size: 18px; margin-bottom: 25px; color: white;">
                    ${data.message}
                </p>
                <p style="font-size: 16px; margin-bottom: 30px; color: white;">
                    The game has been terminated. You can start a new game below.
                </p>
            `;
            
            // Create new game button with vibrant styling
            const newGameBtn = document.createElement("button");
            newGameBtn.innerText = "Start New Game";
            newGameBtn.style.cssText = `
                background-color: #34c759;
                color: white;
                border: none;
                padding: 15px 30px;
                font-size: 20px;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(52, 199, 89, 0.4);
            `;
            
            // Add hover effect to button
            newGameBtn.onmouseover = function() {
                this.style.transform = "scale(1.1)";
                this.style.boxShadow = "0 8px 25px rgba(52, 199, 89, 0.6)";
            };
            
            newGameBtn.onmouseout = function() {
                this.style.transform = "scale(1)";
                this.style.boxShadow = "0 5px 15px rgba(52, 199, 89, 0.4)";
            };
            
            // Add click handler to create new game
            newGameBtn.onclick = function() {
                // Generate a new random room name
                const newRoomName = Math.random().toString(36).substring(2, 8);
                // Navigate to the new room
                window.location.href = `?room=${newRoomName}`;
            };
            
            // Assemble the overlay
            messageContainer.appendChild(newGameBtn);
            overlay.appendChild(messageContainer);
            
            // Add disconnect timestamp at the bottom with improved formatting
            const timestamp = document.createElement("p");
            timestamp.style.cssText = `
                margin-top: 20px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                background-color: rgba(0, 0, 0, 0.5);
                padding: 5px 10px;
                border-radius: 5px;
            `;
            timestamp.innerText = `Disconnection occurred at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            overlay.appendChild(timestamp);
            
            // Add to document
            document.body.appendChild(overlay);
            console.log("Disconnect overlay added");
            
            // Disable pause button if it exists
            if (pauseButton) {
                pauseButton.disabled = true;
                console.log("Pause button disabled");
            }
            
            // Update game status with error styling
            const statusElement = document.getElementById("game-status");
            if (statusElement) {
                statusElement.innerText = "⚠️ GAME TERMINATED - OPPONENT DISCONNECTED ⚠️";
                statusElement.style.color = "#ff3b30";
                statusElement.style.fontWeight = "bold";
                statusElement.style.textTransform = "uppercase";
                console.log("Game status updated");
            }
            
        } catch (error) {
            console.error("Error creating disconnect overlay:", error);
            // Fallback to alert in case of error
            alert(`GAME TERMINATED: ${data.message}`);
        }
    } catch (error) {
        console.error("CRITICAL ERROR in handlePlayerDisconnected:", error);
        // Last resort fallback
        alert(`EMERGENCY: Game terminated! ${data.message || "Opponent disconnected."}`);
    }
}

// Function to handle game paused message
function handleGamePaused(data) {
    console.log('Received game_paused message:', data);
    
    // Store previous state for comparison
    const wasPaused = isPaused;
    
    // Update local state from server
    isPaused = data.paused;
    pausedByClientId = data.pausedByClientId;
    const resumedByClientId = data.resumedByClientId;
    remainingPauseTime = data.remainingTime;
    const isAutoResumed = data.autoResumed || false;

    console.log(`Pause state changed: ${wasPaused} -> ${isPaused}`);
    if (isPaused) {
        console.log(`Game paused by: ${pausedByClientId}`);
        // Add a chat message to show who paused the game
        const chatBox = document.getElementById("chat-box");
        const isMe = pausedByClientId === clientId;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageHTML = `
            <div class="chat-message system">
                <div class="content"><strong>${isMe ? 'You' : 'Opponent'}</strong> paused the game</div>
                <div class="time">${time}</div>
            </div>
        `;
        chatBox.innerHTML += messageHTML;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        console.log(`Game resumed by: ${resumedByClientId || pausedByClientId}`);
        // Add a chat message to show who resumed the game
        if (!isAutoResumed && resumedByClientId) {
            const chatBox = document.getElementById("chat-box");
            const isMe = resumedByClientId === clientId;
            const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const messageHTML = `
                <div class="chat-message system">
                    <div class="content"><strong>${isMe ? 'You' : 'Opponent'}</strong> resumed the game</div>
                    <div class="time">${time}</div>
                </div>
            `;
            chatBox.innerHTML += messageHTML;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    if (isAutoResumed && !isPaused) {
        // Game was auto-resumed after timeout
        const chatBox = document.getElementById("chat-box");
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const messageHTML = `
            <div class="chat-message system">
                <div class="content">Game automatically resumed after 30 second timeout</div>
                <div class="time">${time}</div>
            </div>
        `;
        chatBox.innerHTML += messageHTML;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (isPaused) {
        // Game is being paused - stop animation
        console.log(`Pausing animation. Current animationFrameId: ${animationFrameId}`);
        
        if (animationFrameId) {
            console.log(`Cancelling animation frame: ${animationFrameId}`);
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        // Start the pause timer for everyone except the person who paused
        if (clientId !== pausedByClientId) {
            console.log(`Starting pause timer for client ${clientId}`);
            startPauseTimer();
        }
    } else {
        // Game is being resumed
        console.log(`Resuming animation. Current animationFrameId: ${animationFrameId}`);
        
        // Clear timer
        clearPauseTimer();
        
        // Restart animation forcefully
        if (isGameStarted) {
            // Always cancel existing frames first
            if (animationFrameId) {
                console.log(`Cancelling existing animation frame: ${animationFrameId}`);
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            // Use setTimeout to ensure clean execution stack
            setTimeout(() => {
                console.log("Starting new animation frame from game_paused handler");
                lastTime = performance.now();
                animationFrameId = window.requestAnimationFrame(drawGame);
                console.log(`New animation frame ID: ${animationFrameId}`);
            }, 0);
        }
    }
    
    // Update UI
    updatePauseButtonState();
    updateGameStatus();
}

// Function to update scores with animation
function updateScoreWithAnimation(oldP1Score, newP1Score, oldP2Score, newP2Score) {
    const p1ScoreElem = document.getElementById("player1-score");
    const p2ScoreElem = document.getElementById("player2-score");
    
    // Update Player 1 score with animation if changed
    if (oldP1Score !== newP1Score) {
        // Remove any existing animation
        p1ScoreElem.classList.remove("score-changed");
        
        // Set the new score
        p1ScoreElem.textContent = newP1Score;
        
        // Force a reflow to restart animation
        void p1ScoreElem.offsetWidth;
        
        // Add the animation class
        p1ScoreElem.classList.add("score-changed");
    }
    
    // Update Player 2 score with animation if changed
    if (oldP2Score !== newP2Score) {
        // Remove any existing animation
        p2ScoreElem.classList.remove("score-changed");
        
        // Set the new score
        p2ScoreElem.textContent = newP2Score;
        
        // Force a reflow to restart animation
        void p2ScoreElem.offsetWidth;
        
        // Add the animation class
        p2ScoreElem.classList.add("score-changed");
    }
} 