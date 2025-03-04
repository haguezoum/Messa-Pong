import json
import random
import asyncio
from asgiref.sync import sync_to_async
from django.db import transaction
from .models import Game, GameState

# Game constants
CANVAS_WIDTH = 100  # Using percentage-based coordinates (0-100)
CANVAS_HEIGHT = 100
PADDLE_HEIGHT = 15
PADDLE_WIDTH = 2
BALL_SIZE = 2
WINNING_SCORE = 5
INITIAL_BALL_SPEED = 0.5  # Initial ball speed
BALL_SPEED_INCREMENT = 0.5  # How much to increase speed on paddle hit
MAX_BALL_SPEED = 8.0  # Maximum ball speed
FPS = 60  # Target frames per second
TIME_STEP = 1.0 / FPS  # Time step for physics calculations


class PongGameLogic:
    """Class to handle the Pong game logic."""
    
    # Class variable to store active game states in memory
    active_games = {}
    
    @staticmethod
    async def create_or_join_game(room_name, client_id):
        """Create a new game or join an existing one."""
        game, created = await sync_to_async(PongGameLogic._get_or_create_game)(room_name, client_id)
        
        # If just created, initialize game state
        if created:
            await sync_to_async(PongGameLogic._initialize_game_state)(game)
            # Initialize in-memory state
            PongGameLogic.active_games[room_name] = {
                'ball_x': 50.0,
                'ball_y': 50.0,
                'ball_dx': INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED,
                'ball_dy': INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED,
                'player1_position': 50.0,
                'player2_position': 50.0,
                'player1_score': 0,
                'player2_score': 0
            }
            
        return game, created
    
    @staticmethod
    def _get_or_create_game(room_name, client_id):
        with transaction.atomic():
            # Try to find an existing game
            try:
                game = Game.objects.get(room_name=room_name, is_active=True)
                created = False
                
                # If the game doesn't have player2, add this client
                if not game.player2_id and game.player1_id != client_id:
                    game.player2_id = client_id
                    game.save()
                
                # If this client isn't player1, and player1 slot is empty, set as player1
                elif not game.player1_id and game.player2_id != client_id:
                    game.player1_id = client_id
                    game.save()
                    
            except Game.DoesNotExist:
                # Create a new game with this client as player1
                game = Game.objects.create(
                    room_name=room_name,
                    player1_id=client_id,
                )
                created = True
                
        return game, created
        
    @staticmethod
    def _initialize_game_state(game):
        """Initialize the game state for a new game."""
        # Create initial state with random ball direction
        dx = INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED
        dy = INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED
        
        GameState.objects.create(
            game=game,
            ball_x=50.0,
            ball_y=50.0,
            ball_dx=dx,
            ball_dy=dy,
            player1_position=50.0,
            player2_position=50.0,
            player1_score=0,
            player2_score=0
        )
    
    @staticmethod
    async def update_paddle_position(room_name, client_id, position):
        """Update a player's paddle position."""
        game = await sync_to_async(Game.objects.get)(room_name=room_name, is_active=True)
        
        # Get current state from memory
        state = PongGameLogic.active_games.get(room_name)
        if not state:
            return await sync_to_async(PongGameLogic._get_game_state_dict)(game)
        
        # Determine which player's paddle to update
        if client_id == game.player1_id:
            state['player1_position'] = position
        elif client_id == game.player2_id:
            state['player2_position'] = position
            
        # Return the updated game state
        return {
            'ball_x': state['ball_x'],
            'ball_y': state['ball_y'],
            'player1_position': state['player1_position'],
            'player2_position': state['player2_position'],
            'player1_score': state['player1_score'],
            'player2_score': state['player2_score'],
            'player1_id': game.player1_id,
            'player2_id': game.player2_id,
            'is_full': game.is_full,
            'winner_id': game.winner_id
        }
    
    @staticmethod
    def _get_game_state_dict(game):
        """Convert game state to a dictionary for JSON serialization."""
        state = game.state
        return {
            'ball_x': state.ball_x,
            'ball_y': state.ball_y,
            'player1_position': state.player1_position,
            'player2_position': state.player2_position,
            'player1_score': state.player1_score,
            'player2_score': state.player2_score,
            'player1_id': game.player1_id,
            'player2_id': game.player2_id,
            'is_full': game.is_full,
            'winner_id': game.winner_id
        }
    
    @staticmethod
    async def update_game_state(room_name):
        """Update the game state (ball position, collisions, score)."""
        game = await sync_to_async(Game.objects.get)(room_name=room_name, is_active=True)
        
        # Only update if game is full and active
        if not await sync_to_async(lambda: game.is_full and game.is_active)():
            return await sync_to_async(PongGameLogic._get_game_state_dict)(game)
        
        # Get current state from memory
        state = PongGameLogic.active_games.get(room_name)
        if not state:
            return await sync_to_async(PongGameLogic._get_game_state_dict)(game)
        
        # Get current state values
        ball_x = state['ball_x']
        ball_y = state['ball_y']
        ball_dx = state['ball_dx']
        ball_dy = state['ball_dy']
        player1_pos = state['player1_position']
        player2_pos = state['player2_position']
        player1_score = state['player1_score']
        player2_score = state['player2_score']
        
        # Move the ball
        ball_x += ball_dx
        ball_y += ball_dy
        
        # Check for top/bottom wall collisions
        if ball_y <= 0 or ball_y >= CANVAS_HEIGHT:
            ball_dy = -ball_dy
        
        # Check for paddle collisions (left paddle - player 1)
        if (ball_x <= PADDLE_WIDTH and 
            ball_y >= player1_pos - PADDLE_HEIGHT/2 and 
            ball_y <= player1_pos + PADDLE_HEIGHT/2):
            # Calculate current speed
            current_speed = abs(ball_dx)
            # Increase speed but cap it
            new_speed = min(current_speed + BALL_SPEED_INCREMENT, MAX_BALL_SPEED)
            ball_dx = new_speed  # Bounce right
            relative_intersect = (player1_pos - ball_y) / (PADDLE_HEIGHT/2)
            ball_dy = -relative_intersect * new_speed
        
        # Check for paddle collisions (right paddle - player 2)
        if (ball_x >= CANVAS_WIDTH - PADDLE_WIDTH and 
            ball_y >= player2_pos - PADDLE_HEIGHT/2 and 
            ball_y <= player2_pos + PADDLE_HEIGHT/2):
            # Calculate current speed
            current_speed = abs(ball_dx)
            # Increase speed but cap it
            new_speed = min(current_speed + BALL_SPEED_INCREMENT, MAX_BALL_SPEED)
            ball_dx = -new_speed  # Bounce left
            relative_intersect = (player2_pos - ball_y) / (PADDLE_HEIGHT/2)
            ball_dy = -relative_intersect * new_speed
        
        # Check if ball goes out of bounds (scoring)
        scored = False
        if ball_x <= 0:  # Player 2 scores
            player2_score += 1
            scored = True
        elif ball_x >= CANVAS_WIDTH:  # Player 1 scores
            player1_score += 1
            scored = True
            
        # Reset ball if someone scored
        if scored:
            ball_x = 50.0
            ball_y = 50.0
            # Reset to initial speed with random direction
            ball_dx = INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED
            ball_dy = INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED
        
        # Check for game end
        winner_id = None
        if player1_score >= WINNING_SCORE:
            winner_id = game.player1_id
        elif player2_score >= WINNING_SCORE:
            winner_id = game.player2_id
            
        # Update in-memory state
        state.update({
            'ball_x': ball_x,
            'ball_y': ball_y,
            'ball_dx': ball_dx,
            'ball_dy': ball_dy,
            'player1_position': player1_pos,
            'player2_position': player2_pos,
            'player1_score': player1_score,
            'player2_score': player2_score
        })
        
        # If game is over, save final state to database
        if winner_id:
            await sync_to_async(PongGameLogic._save_final_game_state)(
                game, state, winner_id
            )
            # Clean up in-memory state
            del PongGameLogic.active_games[room_name]
        
        # Return the updated state
        return {
            'ball_x': ball_x,
            'ball_y': ball_y,
            'player1_position': player1_pos,
            'player2_position': player2_pos,
            'player1_score': player1_score,
            'player2_score': player2_score,
            'player1_id': game.player1_id,
            'player2_id': game.player2_id,
            'is_full': game.is_full,
            'winner_id': winner_id
        }

    @staticmethod
    def _save_final_game_state(game, state, winner_id):
        """Save the final game state to the database when the game ends."""
        with transaction.atomic():
            db_state = game.state
            db_state.ball_x = state['ball_x']
            db_state.ball_y = state['ball_y']
            db_state.ball_dx = state['ball_dx']
            db_state.ball_dy = state['ball_dy']
            db_state.player1_position = state['player1_position']
            db_state.player2_position = state['player2_position']
            db_state.player1_score = state['player1_score']
            db_state.player2_score = state['player2_score']
            db_state.save()
            
            game.winner_id = winner_id
            game.is_active = False
            game.save() 