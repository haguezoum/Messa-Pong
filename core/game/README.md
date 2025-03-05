# Pong Game Implementation

A real-time multiplayer Pong game built with Django Channels and WebSockets.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Backend Components](#backend-components)
  - [Frontend Components](#frontend-components)
- [Technical Implementation Details](#technical-implementation-details)
  - [Game State Management](#game-state-management)
  - [Game Flow](#game-flow)
  - [Physics System](#physics-system)
  - [Database Structure](#database-structure)
  - [WebSocket Implementation](#websocket-implementation)
  - [Front-end Rendering](#front-end-rendering)
- [Game Mechanics](#game-mechanics)
- [Code Organization](#code-organization)
- [How to Run](#how-to-run)
- [Bug Fixes](#bug-fixes)
- [Future Improvements](#future-improvements)
- [Technical Optimizations](#technical-optimizations)
- [Game Pause Functionality](#game-pause-functionality)
- [Contributors](#contributors)

## Overview

This project implements a classic Pong game where two players can compete in real-time using WebSockets for communication. The game features a full physics system, score tracking, game rooms, pause/resume functionality, and a chat system - all synchronized across different clients.

## Project Structure

The project follows a standard Django structure with additional organization for the game components:

```
core/game/
│
├── game_app/                     # Main Django application
│   ├── migrations/               # Database migrations
│   │   └── 0001_initial.py      # Initial migration
│   │
│   ├── static/                   # Static assets
│   │   ├── css/                  # CSS files
│   │   │   └── pong.css          # Game styles
│   │   └── js/                   # JavaScript files
│   │       └── pong.js           # Game logic and WebSocket handling
│   │
│   ├── templates/                # HTML templates
│   │   └── index.html            # Main game page
│   │
│   ├── __init__.py
│   ├── admin.py                  # Django admin configuration
│   ├── apps.py                   # Django application configuration
│   ├── consumers.py              # WebSocket consumers
│   ├── game_logic.py             # Game physics and logic
│   ├── models.py                 # Database models
│   ├── routing.py                # WebSocket routing
│   ├── tests.py                  # Tests
│   ├── urls.py                   # URL routing
│   └── views.py                  # HTTP views
│
├── manage.py                     # Django management script
├── db.sqlite3                    # SQLite database
└── README.md                     # Project documentation
```

## Architecture

The application follows a client-server architecture with WebSockets enabling bidirectional real-time communication:

### Backend Components

1. **Django Models** (`models.py`):
   - `Game`: Tracks game sessions, players, and game state
   - `GameState`: Stores the final game state (ball position, paddle positions, scores)

2. **Game Logic** (`game_logic.py`):
   - `PongGameLogic`: Handles all game mechanics including:
     - Ball movement and physics
     - Collision detection (paddles, walls)
     - Scoring and win conditions
     - In-memory game state management
     - Final game state persistence 

3. **WebSocket Consumer** (`consumers.py`):
   - `PongConsumer`: Manages WebSocket connections, including:
     - Connection/disconnection handling
     - Player joining/leaving
     - Message handling (paddle movement, chat)
     - Game loop coordination
     - Broadcasting game state to clients

4. **URL Configuration** (`urls.py` & `routing.py`):
   - HTTP endpoints for serving the game page
   - WebSocket routing for game communication

### Frontend Components

1. **HTML/CSS** (`templates/index.html`, `static/css/pong.css`):
   - Game canvas for rendering
   - Score display
   - Status indicators
   - Chat interface
   - Responsive design

2. **JavaScript** (`static/js/pong.js`):
   - WebSocket connection management
   - Game state handling
   - Canvas rendering
   - Input handling (keyboard controls for paddle movement)
   - Chat functionality
   - Client-side prediction for responsive controls

## Technical Implementation Details

### Game State Management

The game implements an optimized state management system:

1. **In-Memory State**:
   - Active game states are stored in memory using `PongGameLogic.active_games`
   - This reduces database load during gameplay
   - State updates happen at 30 FPS without database writes

2. **Database State**:
   - Initial game state is created in database when game starts
   - Final game state is saved only when game ends
   - Includes final scores, positions, and winner information

3. **State Synchronization**:
   - Server maintains authoritative game state in memory
   - Clients receive state updates via WebSocket
   - Paddle positions are updated immediately for responsiveness

### Game Flow

The game follows a well-defined lifecycle:

1. **Connection Phase**:
   ```
   Client connects → Server creates/joins game → Initial state sent to client
   ```

2. **Game Start**:
   ```
   Second player joins → Game marked as full → Game loop begins
   ```

3. **During Gameplay**:
   ```
   Game loop (30 FPS) → Update ball position → Check collisions → 
   Update scores → Broadcast state to clients
   ```

4. **Pause/Resume**:
   ```
   Player pauses → Game loop paused → Timer starts → 
   Only pausing player can resume → Auto-resume after 30 seconds
   ```

5. **Game End**:
   ```
   Winner determined → Save final state to database → 
   Clean up in-memory state → Notify clients
   ```

### Physics System

The physics system manages:

1. **Ball Movement**: 
   - Position updates based on velocity vectors
   - Speed gradually increases during play
   
2. **Collision Detection**:
   - Wall collisions (top/bottom) with perfect reflection
   - Paddle collisions with angle calculation based on hit position:
     ```python
     relative_intersect = (paddle_pos - ball_y) / (PADDLE_HEIGHT/2)
     ball_dy = -relative_intersect * abs(ball_dx)
     ```
   - This creates more dynamic gameplay where hitting the ball with different parts of the paddle affects trajectory

3. **Scoring**:
   - Detection when ball crosses boundaries
   - Score increment and ball reset
   - Win condition checking (first to 5 points)

### Database Structure

The game uses two primary models to track game state:

1. **Game Model**:
   ```python
   class Game(models.Model):
       id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
       room_name = models.CharField(max_length=100, unique=True)
       created_at = models.DateTimeField(auto_now_add=True)
       is_active = models.BooleanField(default=True)
       player1_id = models.CharField(max_length=100, blank=True, null=True)
       player2_id = models.CharField(max_length=100, blank=True, null=True)
       winner_id = models.CharField(max_length=100, blank=True, null=True)
       last_updated = models.DateTimeField(auto_now=True)
   ```

2. **GameState Model**:
   ```python
   class GameState(models.Model):
       game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name='state')
       ball_x = models.FloatField(default=50.0)
       ball_y = models.FloatField(default=50.0)
       ball_dx = models.FloatField(default=0.5)
       ball_dy = models.FloatField(default=0.5)
       player1_position = models.FloatField(default=50.0)
       player2_position = models.FloatField(default=50.0)
       player1_score = models.IntegerField(default=0)
       player2_score = models.IntegerField(default=0)
   ```

### WebSocket Implementation

The WebSocket implementation uses Django Channels to enable real-time communication:

1. **Connection Handling**:
   ```python
   async def connect(self):
       self.room_name = self.scope['url_route']['kwargs']['room_name']
       self.room_group_name = f"game_{self.room_name}"
       self.client_id = await self.get_or_create_session()
       
       # Join room group
       await self.channel_layer.group_add(self.room_group_name, self.channel_name)
       await self.accept()
       
       # Create or join game
       game, created = await PongGameLogic.create_or_join_game(self.room_name, self.client_id)
   ```

2. **Message Types**:
   | Type | Purpose |
   |------|---------|
   | `game_state` | Updates to the game state |
   | `paddle_move` | Player paddle movement |
   | `chat` | Chat messages |
   | `player_joined` | New player joined notification |
   | `game_over` | Game end notification |
   | `game_paused` | Game pause state notification |

3. **Game Loop**:
   ```python
   async def game_loop(self):
       try:
           while True:
               # Update game state
               state = await PongGameLogic.update_game_state(self.room_name)
               
               # Broadcast state to all clients
               await self.channel_layer.group_send(
                   self.room_group_name,
                   {
                       'type': 'game_state_update',
                       'state': state
                   }
               )
               
               # Check if game is over
               if state.get('winner_id'):
                   # Broadcast game over message
                   await self.channel_layer.group_send(
                       self.room_group_name,
                       {
                           'type': 'game_over',
                           'winner_id': state.get('winner_id')
                       }
                   )
                   break
                   
               # 30 FPS update rate
               await asyncio.sleep(1/30)
       except asyncio.CancelledError:
           pass
   ```

### Front-end Rendering

The game uses the HTML5 Canvas API for rendering with optimized performance:

1. **Drawing Function**:
   ```javascript
   function drawGame(currentTime) {
       // Calculate delta time for smooth animation
       const deltaTime = currentTime - lastTime;
       lastTime = currentTime;
       
       // Clear canvas
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       // Pre-calculate all dimensions once
       const canvasWidth = canvas.width;
       const canvasHeight = canvas.height;
       const paddleWidth = (PADDLE_WIDTH / 100) * canvasWidth;
       const paddleHeight = (PADDLE_HEIGHT / 100) * canvasHeight;
       
       // Use predicted positions for paddles
       let p1Y = (predictedState.player1_position / 100) * canvasHeight;
       let p2Y = (predictedState.player2_position / 100) * canvasHeight;
       
       // Calculate ball position
       const ballX = (gameState.ball_x / 100) * canvasWidth;
       const ballY = (gameState.ball_y / 100) * canvasHeight;
       
       // Draw paddles and ball
       ctx.fillStyle = "white";
       ctx.fillRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight);
       ctx.fillRect(canvasWidth - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight);
       
       ctx.beginPath();
       ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
       ctx.fill();
       
       // Draw center line (visible in all game states)
       ctx.setLineDash([5, 5]);
       ctx.beginPath();
       ctx.moveTo(canvasWidth / 2, 0);
       ctx.lineTo(canvasWidth / 2, canvasHeight);
       ctx.strokeStyle = "white";
       ctx.stroke();
       ctx.setLineDash([]);
   }
   ```

2. **Animation Loop**:
   ```javascript
   function requestNextFrame() {
       if (!isPaused && isGameStarted) {
           animationFrameId = requestAnimationFrame(drawGame);
       }
   }
   ```

3. **Input Handling**:
   ```javascript
   document.addEventListener('keydown', function(e) {
       if (isPaused || (!isPlayer1 && !isPlayer2)) {
           return;
       }
       
       if (isPlayer1) {
           if (e.key.toLowerCase() === 'w') {
               // Update predicted position immediately
               predictedState.player1_position = Math.max(
                   predictedState.player1_position - PADDLE_SPEED, 
                   PADDLE_HEIGHT/2
               );
               
               // Send to server
               sendWsMessage({
                   type: 'paddle_move',
                   position: predictedState.player1_position
               });
           }
       }
       // ... similar code for other keys and Player 2
   });
   ```

4. **Chat Functionality**:
   ```javascript
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
   
   // Handling received chat messages
   function handleChatMessage(data) {
       const isMe = data.client_id === clientId;
       const chatBox = document.getElementById("chat-box");
       chatBox.innerHTML += `<p><strong>${isMe ? 'You' : 'Opponent'}</strong>: ${data.message}</p>`;
       chatBox.scrollTop = chatBox.scrollHeight;
   }
   
   // Smart focus management between game and chat
   document.addEventListener('click', function(e) {
       // Skip setting focus to canvas if clicking on chat elements
       if (e.target === chatInput || e.target === chatButton) {
           return;
       }
       
       if (document.activeElement !== canvas) {
           canvas.focus();
       }
   });
   ```

## Game Mechanics

### Game Flow

1. A player enters the game and is assigned to a room
2. When a second player joins, the game starts automatically
3. Players control their paddles using 'W' (up) and 'S' (down) keys
4. Each time a player misses the ball, their opponent scores a point
5. First player to reach 5 points wins the game
6. Final game state is saved to database and in-memory state is cleaned up

### Position System

The game uses a percentage-based position system (0-100) for device-independent rendering:

- `(0, 0)` represents the top-left corner
- `(100, 100)` represents the bottom-right corner
- This allows the game to function correctly on different screen sizes

### Ball Physics

1. **Initial Direction**: Random on game start and after scoring
2. **Velocity**: Increases slightly after each paddle hit
3. **Reflection Angles**: Based on where the ball hits the paddle:
   - Center hit = straight reflection
   - Edge hit = sharper angle

### Synchronization Strategy

1. **Client-Server Model**: Server is the source of truth
2. **Paddle Positions**: Updated immediately on client for responsiveness, then verified by server
3. **Game State**: Managed in memory during gameplay, saved to database only at game end

## Code Organization

The codebase follows a clean separation of concerns for better maintainability:

1. **Static Assets Structure**:
   - CSS files in `static/css/` directory:
     - `pong.css`: Contains all styles for the game interface
   - JavaScript files in `static/js/` directory:
     - `pong.js`: Contains all game logic and WebSocket handling

2. **Rendering Optimizations**:
   - Center line is always drawn regardless of game state for consistency
   - Paddle positions use client-side prediction for smoother movement
   - Ball trail effect is dynamically adjusted based on speed
   - All animations use `requestAnimationFrame` for optimal performance

3. **Template Structure**:
   - Main HTML file (`templates/index.html`) contains minimal markup
   - External CSS and JS files are loaded using Django's `{% static %}` template tag
   - Game interface is structured with semantic HTML for better accessibility

## How to Run

Follow these steps to set up and run the game locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ft_transcendence/core/game
   ```

2. **Set up a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django channels
   ```

4. **Apply database migrations**:
   ```bash
   python manage.py makemigrations game_app
   python manage.py migrate
   ```

5. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the game**:
   - Open your browser and navigate to `http://localhost:8000/`
   - To play with a friend, share the game URL with the same room name parameter
   - Example: `http://localhost:8000/?room=game123`

## Bug Fixes

Recent fixes include:

1. **Center Line Display**: The dashed center line now remains visible when the game is paused, ensuring visual consistency throughout all game states.

2. **Pause State Visual Feedback**: Improved visual indicators for the pause state to make it clear which player paused the game and who can resume it.

3. **Code Organization**: Separated CSS and JavaScript from the HTML file into dedicated files for better maintainability and performance.

4. **Chat Input Focus**: Fixed an issue where players couldn't click once on the chat input to type messages. Previously, keyboard events were being captured by the game canvas, requiring users to hold down the mouse button while typing. The fix ensures proper focus handling between game controls and chat interface.

## Future Improvements

Potential improvements for the game:

1. **Authentication**: User accounts and persistent player statistics
2. **Game Options**: Customizable game speed, paddle size, and winning score
3. **Power-ups**: Special items that change game dynamics
4. **Matchmaking**: Automatic opponent finding
5. **Spectator Mode**: Allow others to watch ongoing games
6. **Mobile Support**: Touch-based controls for mobile devices
7. **Visual Effects**: Improved graphics and animations

## Technical Optimizations

1. **WebRTC Integration**: For even lower latency peer-to-peer communication
2. **Client-side Prediction**: Improve perceived responsiveness with input prediction
3. **Rate Limiting**: Protect against malicious clients
4. **Session Recovery**: Ability to rejoin ongoing games after disconnection
5. **State Persistence**: Save game state periodically for crash recovery

## Game Pause Functionality

The game implements a robust pause/resume system with the following features:

1. **Pause Mechanism**:
   - Any player can pause the game by clicking the pause button
   - When paused, the game loop is suspended on the server
   - All clients are notified of the pause state via WebSocket

2. **Resume Controls**:
   - Only the player who initiated the pause can manually resume the game
   - A 30-second countdown timer begins when the game is paused
   - After 30 seconds, the game automatically resumes regardless of who paused it

3. **Implementation Details**:
   - Server-side tracking of paused games:
     ```python
     # In consumers.py
     paused_games = set()  # Class variable to track paused games
     
     # When a pause/resume message is received
     if is_paused:
         self.paused_games.add(self.room_name)
     else:
         self.paused_games.discard(self.room_name)
     ```

   - Client-side timer management:
     ```javascript
     // Countdown timer function
     function startPauseTimer() {
         remainingPauseTime = PAUSE_TIMEOUT;
         
         pauseTimer = setInterval(() => {
             remainingPauseTime--;
             updatePauseButtonState();
             updateGameStatus();
             
             // Auto-resume when timer reaches zero
             if (remainingPauseTime <= 0) {
                 // Clear timer and send resume message to server
                 // with autoResumed flag set to true
             }
         }, 1000);
     }
     ```

   - User Interface Updates:
     - The pause button changes to "Resume Game" for the player who paused
     - Other players see "Resuming in Xs" with a countdown
     - Game status messages update dynamically
     - Auto-resume notifications appear in the chat

4. **Synchronization Strategy**:
   - Server coordinates the paused state across all clients
   - Paddle movements and game updates are not processed during pause
   - Animation frames are stopped during pause to conserve resources
   - All state changes are broadcast to maintain consistency

This pause system ensures fair gameplay by preventing unexpected interruptions while still allowing for necessary breaks. The auto-resume feature prevents games from being indefinitely paused.

## Contributors

This Pong game implementation was created as part of the ft_transcendence project.
