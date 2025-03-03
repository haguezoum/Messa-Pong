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
BALL_SPEED_INCREMENT = 0.1


class PongGameLogic:
    """Class to handle the Pong game logic."""
    
    @staticmethod
    async def create_or_join_game(room_name, client_id):
        """Create a new game or join an existing one."""
        game, created = await sync_to_async(PongGameLogic._get_or_create_game)(room_name, client_id)
        
        # If just created, initialize game state
        if created:
            await sync_to_async(PongGameLogic._initialize_game_state)(game)
            
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
        dx = 1.5 if random.random() > 0.5 else -1.5
        dy = 1.5 if random.random() > 0.5 else -1.5
        
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
        game_state = await sync_to_async(lambda: game.state)()
        
        # Determine which player's paddle to update
        if client_id == game.player1_id:
            game_state.player1_position = position
        elif client_id == game.player2_id:
            game_state.player2_position = position
            
        await sync_to_async(game_state.save)()
        
        # Return the updated game state
        return await sync_to_async(PongGameLogic._get_game_state_dict)(game)
    
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
        
        state = await sync_to_async(lambda: game.state)()
        
        # Get current state values
        ball_x = state.ball_x
        ball_y = state.ball_y
        ball_dx = state.ball_dx
        ball_dy = state.ball_dy
        player1_pos = state.player1_position
        player2_pos = state.player2_position
        player1_score = state.player1_score
        player2_score = state.player2_score
        
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
            ball_dx = abs(ball_dx) + BALL_SPEED_INCREMENT  # Bounce right and increase speed
            # Adjust y velocity based on where ball hits paddle
            # (hit on edge = sharper angle)
            relative_intersect = (player1_pos - ball_y) / (PADDLE_HEIGHT/2)
            ball_dy = -relative_intersect * abs(ball_dx)
        
        # Check for paddle collisions (right paddle - player 2)
        if (ball_x >= CANVAS_WIDTH - PADDLE_WIDTH and 
            ball_y >= player2_pos - PADDLE_HEIGHT/2 and 
            ball_y <= player2_pos + PADDLE_HEIGHT/2):
            ball_dx = -abs(ball_dx) - BALL_SPEED_INCREMENT  # Bounce left and increase speed
            # Adjust y velocity based on where ball hits paddle
            relative_intersect = (player2_pos - ball_y) / (PADDLE_HEIGHT/2)
            ball_dy = -relative_intersect * abs(ball_dx)
        
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
            ball_dx = 1.5 if random.random() > 0.5 else -1.5
            ball_dy = 1.5 if random.random() > 0.5 else -1.5
        
        # Check for game end - make sure we set the correct winner
        winner_id = None
        if player1_score >= WINNING_SCORE:
            winner_id = game.player1_id
        elif player2_score >= WINNING_SCORE:
            winner_id = game.player2_id
            
        # Update database
        await sync_to_async(PongGameLogic._save_game_state)(
            game, ball_x, ball_y, ball_dx, ball_dy,
            player1_pos, player2_pos, player1_score, player2_score, winner_id
        )
        
        # Return the updated state
        return await sync_to_async(PongGameLogic._get_game_state_dict)(game)
    
    @staticmethod
    def _save_game_state(game, ball_x, ball_y, ball_dx, ball_dy, 
                        player1_pos, player2_pos, player1_score, player2_score, winner_id):
        """Save the current game state to the database."""
        with transaction.atomic():
            state = game.state
            state.ball_x = ball_x
            state.ball_y = ball_y
            state.ball_dx = ball_dx
            state.ball_dy = ball_dy
            state.player1_position = player1_pos
            state.player2_position = player2_pos
            state.player1_score = player1_score
            state.player2_score = player2_score
            state.save()
            
            if winner_id:
                game.winner_id = winner_id
                game.is_active = False
                game.save() 