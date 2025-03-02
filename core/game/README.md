# Pong Game Implementation

A real-time multiplayer Pong game built with Django Channels and WebSockets.

## Overview

This project implements a classic Pong game where two players can compete in real-time using WebSockets for communication. The game features a full physics system, score tracking, game rooms, and a chat system - all synchronized across different clients.

## Architecture

The application follows a client-server architecture with WebSockets enabling bidirectional real-time communication:

### Backend Components

1. **Django Models** (`models.py`):
   - `Game`: Tracks game sessions, players, and game state
   - `GameState`: Stores the dynamic game state (ball position, paddle positions, scores)

2. **Game Logic** (`game_logic.py`):
   - `PongGameLogic`: Handles all game mechanics including:
     - Ball movement and physics
     - Collision detection (paddles, walls)
     - Scoring and win conditions
     - Game state management

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

1. **HTML/CSS** (`templates/index.html`):
   - Game canvas for rendering
   - Score display
   - Status indicators
   - Chat interface
   - Responsive design

2. **JavaScript**:
   - WebSocket connection management
   - Game state handling
   - Canvas rendering
   - Input handling (mouse movement for paddle control)
   - Chat functionality

## Technical Implementation Details

### Game State Synchronization

The game implements a real-time synchronization system:

1. Each client connects to the server via WebSockets
2. Server assigns a client ID and associates the client with a game room
3. Server manages the authoritative game state
4. Game state updates are broadcast to clients at 60 FPS
5. Clients render the game based on received state

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
   - Win condition checking

### Database Structure

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

The WebSocket implementation uses Django Channels:

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
   - `game_state`: Updates to the game state
   - `paddle_move`: Player paddle movement
   - `chat`: Chat messages
   - `player_joined`: New player joined notification
   - `game_over`: Game end notification

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
                   
               # 60 FPS update rate
               await asyncio.sleep(1/60)
       except asyncio.CancelledError:
           pass
   ```

### Front-end Rendering

The game uses the HTML5 Canvas API for rendering:

1. **Drawing Function**:
   ```javascript
   function drawGame() {
       // Clear canvas
       ctx.clearRect(0, 0, canvas.width, canvas.height);
       
       // Convert percentage to actual canvas coordinates
       const ballX = (gameState.ball_x / 100) * canvas.width;
       const ballY = (gameState.ball_y / 100) * canvas.height;
       const p1Y = (gameState.player1_position / 100) * canvas.height;
       const p2Y = (gameState.player2_position / 100) * canvas.height;
       
       // Draw paddles and ball
       ctx.fillStyle = "white";
       ctx.fillRect(0, p1Y - paddleHeight/2, paddleWidth, paddleHeight);
       ctx.fillRect(canvas.width - paddleWidth, p2Y - paddleHeight/2, paddleWidth, paddleHeight);
       
       ctx.beginPath();
       ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
       ctx.fill();
       
       // Draw center line
       ctx.setLineDash([5, 5]);
       ctx.beginPath();
       ctx.moveTo(canvas.width / 2, 0);
       ctx.lineTo(canvas.width / 2, canvas.height);
       ctx.strokeStyle = "white";
       ctx.stroke();
   }
   ```

2. **Input Handling**:
   ```javascript
   canvas.addEventListener('mousemove', function(e) {
       if (isPlayer1 || isPlayer2) {
           const rect = canvas.getBoundingClientRect();
           const mouseY = e.clientY - rect.top;
           const paddlePosition = (mouseY / canvas.height) * 100;
           
           socket.send(JSON.stringify({
               type: 'paddle_move',
               position: paddlePosition
           }));
       }
   });
   ```

## Game Mechanics

### Game Flow

1. A player enters the game and is assigned to a room
2. When a second player joins, the game starts automatically
3. Players control their paddles using mouse movement
4. Each time a player misses the ball, their opponent scores a point
5. First player to reach 5 points wins the game

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
3. **Game State**: Fully managed by server and broadcast to clients

## How to Run

1. Ensure Django and Channels are installed:
   ```
   pip install django channels
   ```

2. Apply database migrations:
   ```
   python manage.py makemigrations game_app
   python manage.py migrate
   ```

3. Run the development server:
   ```
   python manage.py runserver
   ```

4. Access the game at `http://localhost:8000/`

5. To play with a friend, share the game URL with the same room name parameter

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

## Contributors

This Pong game implementation was created as part of the ft_transcendence project. 