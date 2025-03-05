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
    
    // Draw paddles with optimized rendering
    ctx.fillStyle = "white";
    
    // Draw paddles using predicted positions
    ctx.fillRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight);
    ctx.fillRect(canvasWidth - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight);
    
    // Optimize ball trail effect
    const currentSpeed = Math.sqrt(gameState.ball_dx * gameState.ball_dx + gameState.ball_dy * gameState.ball_dy);
    if (currentSpeed > 3) {
        const trailLength = Math.min(currentSpeed * 1.2, 3);
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(ballX - (gameState.ball_dx * trailLength), ballY - (gameState.ball_dy * trailLength), ballSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Draw main ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw center line - Always draw regardless of pause state
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.setLineDash([]);
    
    requestNextFrame();
}

// Add this new function for optimized frame requesting
function requestNextFrame() {
    if (!isPaused && isGameStarted) {
        animationFrameId = requestAnimationFrame(drawGame);
    }
}

// Update the updateGameState function to reconcile server state with predicted state
function updateGameState(state) {
    // Update the game state from server
    gameState = state;
    
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
    if (!state.is_full) {
        document.getElementById("game-status").innerText = "Waiting for opponent...";
        pauseButton.disabled = true;
    } else if (state.winner_id) {
        // This will be handled by the game_over event
        pauseButton.disabled = true;
    } else {
        if (!isPaused) {
            document.getElementById("game-status").innerText = "Game in progress";
        }
        pauseButton.disabled = false;
    }
    
    // Update score
    document.getElementById("player1-score").innerText = `Player 1: ${state.player1_score}`;
    document.getElementById("player2-score").innerText = `Player 2: ${state.player2_score}`;
    
    // Start animation if not already running
    if (!animationFrameId && !isPaused && isGameStarted) {
        animationFrameId = requestAnimationFrame(drawGame);
    }
}

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("Received:", data);
    
    // Handle different message types
    switch(data.type) {
        case "game_state":
            if (data.client_id) {
                clientId = data.client_id;
            }
            console.log("Updating game state:", data.state.player1_position, data.state.player2_position);
            updateGameState(data.state);
            // Enable pause button when game starts
            if (!isGameStarted && data.state.is_full) {
                isGameStarted = true;
                pauseButton.disabled = false;
            } 
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
            console.log('Received pause state', data);
            isPaused = data.paused;
            pausedByClientId = data.pausedByClientId;
            remainingPauseTime = data.remainingTime;
            const isAutoResumed = data.autoResumed || false;

            if (isAutoResumed && !isPaused) {
                // Game was auto-resumed after timeout
                const chatBox = document.getElementById("chat-box");
                chatBox.innerHTML += `<p><em>Game automatically resumed after 30 second timeout</em></p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            }

            if (isPaused) {
                // Stop animation if game is paused
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                
                // Start the pause timer for everyone except the person who paused
                if (clientId !== pausedByClientId) {
                startPauseTimer();
                }
            } else {
                // Clear timer when game is resumed
                clearPauseTimer();
                
                // Restart animation
                if (!animationFrameId && isGameStarted) {
                    animationFrameId = requestAnimationFrame(drawGame);
                }
            }

            updatePauseButtonState();
            updateGameStatus();
            break;
        default:
            console.log('Default...')
            // Set client ID if available
            if (data.client_id && !clientId) {
                clientId = data.client_id;
                console.log("My client ID:", clientId);
            }
    }
};

socket.onclose = function() {
    console.log("Disconnected from WebSocket");
    document.getElementById("game-status").innerText = "Connection lost. Please refresh.";
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
    
    // Add chat message
    const isMe = data.client_id === clientId;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>${isMe ? 'You' : 'Opponent'}</strong> joined the game</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle chat messages
function handleChatMessage(data) {
    const isMe = data.client_id === clientId;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>${isMe ? 'You' : 'Opponent'}</strong>: ${data.message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle game over
function handleGameOver(data) {
    const winnerId = data.winner_id;
    let message = "";
    
    // Check if we're the winner
    if (isPlayer1 && winnerId === gameState.player1_id || 
        isPlayer2 && winnerId === gameState.player2_id) {
        message = "You win!";
    } else {
        message = "You lose!";
    }
    
    // For spectators or if winner logic fails
    if (!isPlayer1 && !isPlayer2) {
        if (winnerId === gameState.player1_id) {
            message = "Player 1 wins!";
        } else {
            message = "Player 2 wins!";
        }
    }
    
    document.getElementById("game-status").innerText = message;
    
    // Add chat message
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<p><strong>Game Over</strong>: ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to send chat messages
function sendChatMessage() {
    const input = document.getElementById("chat-message");
    const message = input.value.trim();
    
    if (message) {
        sendWsMessage({
            type: 'chat',
            message: message
        });
        
        input.value = "";
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
                    pausedByClientId: null,
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

function updateGameStatus() {
    const statusElement = document.getElementById("game-status");
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
    console.log('Toggling pause', { isPaused, pausedByClientId, clientId });
    
    // When trying to resume, only the player who paused can do it
    if (isPaused && clientId !== pausedByClientId) {
        console.log("Only the client who paused can resume!");
        return;
    }

    isPaused = !isPaused;

    if (isPaused) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        pausedByClientId = clientId;
        startPauseTimer();
    } else {
        pausedByClientId = null;
        clearPauseTimer();
        
        // If we're resuming, start the animation again
        if (isGameStarted && !animationFrameId) {
            animationFrameId = requestAnimationFrame(drawGame);
        }
    }

    // Use the enhanced send function
    sendWsMessage({
        type: 'toggle_pause',
        paused: isPaused,
        pausedByClientId: pausedByClientId,
        remainingTime: remainingPauseTime
    });

    updatePauseButtonState();
    updateGameStatus();
}

// Start the game loop
if (isGameStarted && !isPaused) {
    animationFrameId = requestAnimationFrame(drawGame);
} 