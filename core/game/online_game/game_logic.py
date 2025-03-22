import json
import random
import asyncio
from asgiref.sync import sync_to_async
from django.db import transaction
from .models import Game, GameState, PlayerQueue

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
MIN_BALL_SPEED = 0.3  # Minimum ball speed to ensure movement


class PongGameLogic:
    """Class to handle the Pong game logic."""
    
    # Class variable to store active game states in memory
    active_games = {}
    
    @staticmethod
    async def create_or_join_game(room_name, client_id):
        """Create a new game or join an existing one."""
        game, created, status = await sync_to_async(PongGameLogic._get_or_create_game)(room_name, client_id)
        
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
            
        return game, created, status
    
    @staticmethod
    def _get_or_create_game(room_name, client_id):
        with transaction.atomic():
            # Try to find an existing game
            try:
                game = Game.objects.get(room_name=room_name, is_active=True)
                created = False
                
                # Check if game is full (both player slots are filled and this client isn't one of them)
                if (game.player1_id and game.player2_id and 
                    game.player1_id != client_id and game.player2_id != client_id):
                    return game, False, "room_full"
                
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
                
        return game, created, "success"
        
    @staticmethod
    def find_match_or_queue(client_id):
        """Find a match for the player or add them to the queue."""
        with transaction.atomic():
            # First check if player is already in an active game
            player_games = Game.objects.filter(
                is_active=True
            ).filter(
                player1_id=client_id
            ) | Game.objects.filter(
                is_active=True
            ).filter(
                player2_id=client_id
            )
            
            if player_games.exists():
                # Player is already in a game, return it
                return player_games.first(), False, "already_in_game"
            
            # Check if player is already in queue
            existing_entry = PlayerQueue.objects.filter(
                player_id=client_id, 
                is_matched=False
            ).first()
            
            if existing_entry:
                # Player already in queue, return their queue entry
                return existing_entry, False, "already_in_queue"
            
            # Look for the oldest unmatched player in queue
            waiting_player = PlayerQueue.objects.filter(
                is_matched=False
            ).exclude(player_id=client_id).order_by('joined_at').first()
            
            if waiting_player:
                # We found a match! Create a new game
                room_name = f"match_{random.randint(1000, 9999)}"
                
                # Create a new game with both players
                game = Game.objects.create(
                    room_name=room_name,
                    player1_id=waiting_player.player_id,
                    player2_id=client_id,
                )
                
                # Update the queue entries
                waiting_player.is_matched = True
                waiting_player.game = game
                waiting_player.save()
                
                # Create a new queue entry for this player and mark as matched
                queue_entry = PlayerQueue.objects.create(
                    player_id=client_id,
                    is_matched=True,
                    game=game
                )
                
                # Initialize game state
                PongGameLogic._initialize_game_state(game)
                
                return game, True, "match_found"
            else:
                # No match available, add to queue
                queue_entry = PlayerQueue.objects.create(
                    player_id=client_id,
                    is_matched=False
                )
                
                return queue_entry, True, "added_to_queue"
        
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
        try:
            game = await sync_to_async(Game.objects.get)(room_name=room_name, is_active=True)
            
            # Get current state from memory or from database
            state = PongGameLogic.active_games.get(room_name)
            if not state:
                # Recreate state from database if it's missing
                print(f"State missing for room {room_name}, recreating from database")
                state_dict = await sync_to_async(PongGameLogic._get_game_state_dict)(game)
                is_full = await sync_to_async(lambda: game.is_full)()
                
                # If game is full, ensure we have proper ball velocity
                if is_full:
                    # Initialize with random direction if both players present
                    state = {
                        'ball_x': 50.0,
                        'ball_y': 50.0,
                        'ball_dx': INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED,
                        'ball_dy': INITIAL_BALL_SPEED if random.random() > 0.5 else -INITIAL_BALL_SPEED,
                        'player1_position': state_dict['player1_position'],
                        'player2_position': state_dict['player2_position'],
                        'player1_score': state_dict['player1_score'],
                        'player2_score': state_dict['player2_score'],
                    }
                    PongGameLogic.active_games[room_name] = state
                
                return {
                    **state_dict,
                    'game_ready': is_full
                }
            
            # Check if game is full and active
            is_full = await sync_to_async(lambda: game.is_full)()
            is_active = await sync_to_async(lambda: game.is_active)()
            
            # Return current state without movement if game is not full or not active
            if not is_full or not is_active:
                # Set ball position to center when not full/active
                state['ball_x'] = 50.0
                state['ball_y'] = 50.0
                
                return {
                    'ball_x': state['ball_x'],
                    'ball_y': state['ball_y'],
                    'player1_position': state['player1_position'],
                    'player2_position': state['player2_position'],
                    'player1_score': state['player1_score'],
                    'player2_score': state['player2_score'],
                    'player1_id': game.player1_id,
                    'player2_id': game.player2_id,
                    'is_full': is_full,
                    'winner_id': game.winner_id,
                    'game_ready': False  # Game is not ready when not full
                }
        
            # Get current state values
            ball_x = state['ball_x']
            ball_y = state['ball_y']
            ball_dx = state['ball_dx']
            ball_dy = state['ball_dy']
            player1_pos = state['player1_position']
            player2_pos = state['player2_position']
            player1_score = state['player1_score']
            player2_score = state['player2_score']
            
            # Ensure ball is moving if both players are present
            if abs(ball_dx) < MIN_BALL_SPEED:
                ball_dx = INITIAL_BALL_SPEED if ball_dx >= 0 else -INITIAL_BALL_SPEED
                print(f"Fixing ball x velocity to {ball_dx}")
            
            if abs(ball_dy) < MIN_BALL_SPEED:
                ball_dy = INITIAL_BALL_SPEED if ball_dy >= 0 else -INITIAL_BALL_SPEED
                print(f"Fixing ball y velocity to {ball_dy}")
            
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
                'is_full': is_full,
                'winner_id': winner_id,
                'game_ready': True  # Game is always ready when it's full
            }
        except Game.DoesNotExist:
            print(f"Game does not exist: room_name={room_name}")
            # Re-raise to be caught by the consumer game loop
            raise
        except Exception as e:
            print(f"Error updating game state for {room_name}: {e}")
            import traceback
            traceback.print_exc()
            raise

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

    @staticmethod
    async def get_game_player_info(room_name):
        """Get information about players in a specific game room."""
        try:
            from .models import Game
            
            # Get the game from the database
            game = await sync_to_async(Game.objects.filter)(room_name=room_name, is_active=True)
            game = await sync_to_async(lambda: list(game)[0] if game.exists() else None)()
            
            if game:
                # Return basic player information
                return {
                    'player1_id': game.player1_id,
                    'player2_id': game.player2_id,
                    'room_name': room_name,
                    'is_active': game.is_active
                }
            return None
        except Exception as e:
            print(f"Error in get_game_player_info: {e}")
            return None 