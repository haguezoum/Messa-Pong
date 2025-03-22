import json
import uuid
import asyncio
import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.sessions.backends.db import SessionStore
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from .game_logic import PongGameLogic
from .models import Game

class PongConsumer(AsyncWebsocketConsumer):
    game_tasks = {}  # Class variable to store game update tasks
    paused_games = set()  # Track paused games
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"

        # Ensure session key exists and is stored asynchronously
        self.client_id = await self.get_or_create_session()
        
        # Check if this player is authorized for this game
        is_authorized = await self.check_player_authorization()
        if not is_authorized:
            print(f"Unauthorized player {self.client_id} tried to join room {self.room_name}")
            
            # Accept the connection so we can send the rejection message
            await self.accept()
            
            # Send the unauthorized message
            await self.send(text_data=json.dumps({
                'type': 'unauthorized',
                'message': 'You are not authorized to join this game. Only the two matched players can access it.'
            }))
            
            # Close the connection after sending the message
            await self.close(code=4001)  # Use custom code for unauthorized
            return
        
        # First check if the room is full before joining
        game, created, status = await PongGameLogic.create_or_join_game(self.room_name, self.client_id)
        
        # Accept the connection so we can send messages
        await self.accept()
        
        # Check if the room is full - do this BEFORE joining the group
        if status == "room_full":
            print(f"Room {self.room_name} is full. Rejecting player {self.client_id}")
            
            # Send the room full message
            await self.send(text_data=json.dumps({
                'type': 'room_full',
                'message': 'This game room is full. Only 2 players are allowed per room.',
                'suggest_create_room': True
            }))
            
            # Log the rejection
            print(f"Player {self.client_id} rejected from full room: {self.room_name}")
            
            # Close the connection after sending the message
            await self.close(code=1000)  # Use normal closure code
            return
        
        # If not full, then join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        
        print(f"Player {self.client_id} joined room {self.room_name} (Player {1 if game.player1_id == self.client_id else 2})")
        
        # Send initial game state to the client
        game_state = await sync_to_async(PongGameLogic._get_game_state_dict)(game)
        game_state['game_ready'] = game.is_full  # Only set game_ready to true if both players are present
        
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': game_state,
            'client_id': self.client_id
        }))
        
        # If this is a new full game, start the game loop
        if created or self.room_name not in self.game_tasks:
            self.game_tasks[self.room_name] = asyncio.create_task(self.game_loop())
            print(f"Created new game loop for room {self.room_name}")
            
        # Notify all clients about the player joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_joined',
                'client_id': self.client_id,
                'state': game_state
            }
        )
        
        # Send game_ready message only if the room just became full with this player
        is_full = await sync_to_async(lambda: game.is_full)()
        if is_full:
            # Check if this player was the one that made the game full
            is_new_player = (game.player1_id == self.client_id and created) or (game.player2_id == self.client_id and not created)
            print(f"Game {self.room_name} is {'now' if is_new_player else 'already'} full with players {game.player1_id} and {game.player2_id}")
            
            # Ensure the game state is updated before sending ready message
            await asyncio.sleep(0.1)  # Small delay to ensure states are consistent
            state = await PongGameLogic.update_game_state(self.room_name)
            
            # Send an immediate game state update first to ensure both clients have the same initial state
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state_update',
                    'state': state
                }
            )
            
            # Send a message to all clients that the game is ready to start
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_ready',
                    'message': 'Game has started!'
                }
            )

    async def disconnect(self, close_code):
        print(f"DISCONNECT TRIGGERED for client {self.client_id} in room {self.room_name}, code: {close_code}")
        
        # Check for active player before doing anything else
        is_active_player = False
        player_number = 0
        
        try:
            # Quick check if we're an active player to send notification BEFORE leaving the group
            # Get game info to check player IDs
            game_info = await PongGameLogic.get_game_player_info(self.room_name)
            
            if game_info:
                if game_info.get('player1_id') == self.client_id:
                    is_active_player = True
                    player_number = 1
                elif game_info.get('player2_id') == self.client_id:
                    is_active_player = True
                    player_number = 2
            
            # If we're an active player, send notification FIRST before leaving group
            if is_active_player:
                player_label = f"Player {player_number}"
                print(f"⚠️ ACTIVE PLAYER {self.client_id} ({player_label}) DISCONNECTED from room: {self.room_name}")
                
                # Send disconnection message BEFORE leaving the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_disconnected',
                        'client_id': self.client_id,
                        'player_number': player_number,
                        'player_label': player_label,
                        'message': f"⚠️ {player_label} HAS DISCONNECTED! The game has been terminated.",
                        'timestamp': str(datetime.datetime.now())
                    }
                )
                
                # Give the message time to be delivered
                await asyncio.sleep(0.2)
        except Exception as e:
            print(f"Error during pre-disconnect notification: {e}")
        
        # Now leave the room group
        try:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            print(f"Removed {self.client_id} from group {self.room_group_name}")
        except Exception as e:
            print(f"Error removing from group: {e}")
        
        # Always try to clean up queue entries for this client, regardless of player status
        try:
            # Import models here to avoid circular imports
            from .models import PlayerQueue
            # Use database transaction to ensure atomic operation
            from django.db import transaction
            
            @sync_to_async
            def remove_from_queue():
                with transaction.atomic():
                    PlayerQueue.objects.filter(player_id=self.client_id).delete()
                    print(f"Removed player {self.client_id} from queue")
            
            await remove_from_queue()
        except Exception as e:
            print(f"Error removing player from queue: {e}")
        
        # Handle active player disconnect tasks
        if is_active_player:
            try:
                # Mark the game as inactive in the database with retry logic
                max_retries = 3
                retry_count = 0
                success = False
                
                while retry_count < max_retries and not success:
                    try:
                        from .models import Game
                        # Use transaction to ensure database consistency
                        @sync_to_async
                        def mark_game_inactive():
                            with transaction.atomic():
                                game = Game.objects.get(room_name=self.room_name, is_active=True)
                                game.is_active = False
                                game.save(update_fields=['is_active', 'last_updated'])
                        
                        await mark_game_inactive()
                        print(f"Game {self.room_name} marked as inactive in database")
                        success = True
                    except Exception as e:
                        retry_count += 1
                        print(f"Error updating game in database (attempt {retry_count}): {e}")
                        await asyncio.sleep(0.5)  # Wait before retrying
                
                if not success:
                    print(f"⚠️ Failed to mark game {self.room_name} as inactive after {max_retries} attempts")
                
                # Remove from paused games set
                if self.room_name in self.paused_games:
                    self.paused_games.discard(self.room_name)
                    print(f"Removed {self.room_name} from paused games")
                
                # Cancel game task
                if self.room_name in self.game_tasks:
                    try:
                        self.game_tasks[self.room_name].cancel()
                        del self.game_tasks[self.room_name]
                        print(f"Canceled game task for room {self.room_name}")
                    except Exception as e:
                        print(f"Error canceling game task: {e}")
            except Exception as e:
                print(f"Error in active player cleanup: {e}")
        else:
            print(f"Non-active player {self.client_id} disconnected from room: {self.room_name}")
        
        print(f"Disconnect processing completed for {self.client_id}")

    async def receive(self, text_data):
        """Receive message from WebSocket."""
        data = json.loads(text_data)
        message_type = data.get('type', '')
        
        if message_type == 'paddle_move':
            # Only process paddle moves if game is not paused
            if self.room_name not in self.paused_games:
                # Handle paddle movement
                position = data.get('position', 50)
                state = await PongGameLogic.update_paddle_position(self.room_name, self.client_id, position)
                
                # Send updated state to the group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_state_update',
                        'state': state,
                        'client_id': self.client_id
                    }
                )
        elif message_type == 'toggle_pause':
            # Handle pause/resume
            is_paused = data.get('paused', False)
            paused_by = data.get('pausedByClientId', None)
            resumed_by = data.get('resumedByClientId', None)  # Get who resumed explicitly
            remaining_time = data.get('remainingTime', 30)
            auto_resumed = data.get('autoResumed', False)
            
            # Log the action
            action = "paused" if is_paused else "resumed"
            auto_str = " (auto)" if auto_resumed else ""
            
            # Use explicit resumedByClientId for logging who resumed
            if is_paused:
                print(f"Game {action}{auto_str} by {paused_by}, room: {self.room_name}")
            else:
                # Use resumed_by if available, otherwise fall back to self.client_id
                player_who_resumed = resumed_by if resumed_by else self.client_id
                
                # Special handling for auto-resume
                if resumed_by == 'auto' or auto_resumed:
                    print(f"Game automatically resumed after timeout (paused by {paused_by}), room: {self.room_name}")
                else:
                    print(f"Game {action}{auto_str} by {player_who_resumed}, room: {self.room_name}")
            
            # Broadcast pause state to all clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_paused',
                    'paused': is_paused,
                    'pausedByClientId': paused_by,
                    'resumedByClientId': None if is_paused else (resumed_by or self.client_id),
                    'remainingTime': remaining_time,
                    'autoResumed': auto_resumed
                }
            )
            
            if is_paused:
                self.paused_games.add(self.room_name)
            else:
                self.paused_games.discard(self.room_name)
        elif message_type == 'chat':
            # Handle chat messages
            message = data.get('message', '')
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'client_id': self.client_id
                }
            )

    async def game_loop(self):
        """Main game loop that updates the game state periodically."""
        try:
            # Log that the game loop is starting
            print(f"Starting game loop for room: {self.room_name}")
            
            # Small initial delay to allow clients to initialize
            await asyncio.sleep(0.2)
            
            # Send an initial update to ensure we have the latest state
            try:
                initial_state = await PongGameLogic.update_game_state(self.room_name)
                
                # Send updated game state to all clients
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_state_update',
                        'state': initial_state
                    }
                )
                print(f"Sent initial game state update for room {self.room_name}")
            except Exception as e:
                print(f"Error sending initial state: {e}")
            
            # Main game loop
            update_count = 0
            last_log_time = asyncio.get_event_loop().time()
            
            while True:
                # Only update game state if not paused
                if self.room_name not in self.paused_games:
                    try:
                        state = await PongGameLogic.update_game_state(self.room_name)
                        
                        # Send updated game state to all clients
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_state_update',
                                'state': state
                            }
                        )
                        
                        update_count += 1
                        current_time = asyncio.get_event_loop().time()
                        
                        # Log updates per second every 5 seconds for debugging
                        if current_time - last_log_time >= 5:
                            fps = update_count / (current_time - last_log_time)
                            print(f"Game {self.room_name} running at {fps:.1f} updates/sec")
                            update_count = 0
                            last_log_time = current_time
                        
                        # Check for game over
                        if state.get('winner_id'):
                            print(f"Game over in room {self.room_name}, winner: {state.get('winner_id')}")
                            await self.channel_layer.group_send(
                                self.room_group_name,
                                {
                                    'type': 'game_over',
                                    'winner_id': state.get('winner_id')
                                }
                            )
                            break
                    except Game.DoesNotExist:
                        # Game was deleted or doesn't exist - terminate the game loop
                        print(f"Game loop terminated: Game with room_name={self.room_name} no longer exists in database.")
                        # Exit the loop if the game doesn't exist anymore
                        break
                    except Exception as e:
                        print(f"Error in game update loop: {e}")
                        import traceback
                        traceback.print_exc()
                
                # Pause between updates (30 FPS equivalent)
                await asyncio.sleep(1/30)
        except asyncio.CancelledError:
            print(f"Game loop cancelled for room: {self.room_name}")
        except Exception as e:
            print(f"Unexpected error in game loop: {e}")
        finally:
            if self.room_name in self.game_tasks:
                del self.game_tasks[self.room_name]
            print(f"Game loop ended for room: {self.room_name}")

    async def game_state_update(self, event):
        """Send game state update to client."""
        state = event.get('state', {})
        
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': state
        }))
        
    
    async def player_joined(self, event):
        """Handle player joined event."""
        client_id = event.get('client_id', '')
        state = event.get('state', {})
        
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'client_id': client_id,
            'state': state
        }))
        
    async def chat_message(self, event):
        """Handle chat message event."""
        message = event.get('message', '')
        client_id = event.get('client_id', '')
        
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'client_id': client_id
        }))
        
    async def game_over(self, event):
        """Handle game over event."""
        winner_id = event.get('winner_id', '')
        
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner_id': winner_id
        }))

    async def game_paused(self, event):
        """Handle game paused event."""
        await self.send(text_data=json.dumps({
            'type': 'game_paused',
            'paused': event['paused'],
            'pausedByClientId': event['pausedByClientId'],
            'resumedByClientId': event['resumedByClientId'],
            'remainingTime': event['remainingTime'],
            'autoResumed': event.get('autoResumed', False)
        }))

    async def player_disconnected(self, event):
        """Handle player disconnected event."""
        try:
            disconnected_client_id = event.get('client_id', '')
            player_number = event.get('player_number', 0)
            player_label = event.get('player_label', f"Player {player_number}")
            message = event.get('message', f"{player_label} has disconnected from the game.")
            timestamp = event.get('timestamp', '')
            
            # Log the event
            print(f"⚠️ SENDING player_disconnected to client {self.client_id} about {disconnected_client_id}")
            
            # Send the player_disconnected message to WebSocket with emergency flag
            await self.send(text_data=json.dumps({
                'type': 'player_disconnected',
                'client_id': disconnected_client_id,
                'player_number': player_number,
                'player_label': player_label,
                'message': message,
                'timestamp': timestamp,
                'emergency': True  # Flag to ensure client treats this as highest priority
            }))
            
            print(f"✅ SENT player_disconnected to client {self.client_id}")
        except Exception as e:
            print(f"❌ ERROR in player_disconnected handler: {e}")

    async def game_ready(self, event):
        """Handle game ready event when both players have joined."""
        message = event.get('message', 'Game is ready to start!')
        
        await self.send(text_data=json.dumps({
            'type': 'game_ready',
            'message': message
        }))

    @sync_to_async
    def get_or_create_session(self):
        """Ensures the session exists and returns its session key."""
        try:
            session = self.scope["session"]
            if not session.session_key:
                session.create()  # Creates a new session in DB
            return session.session_key
        except KeyError:
            # If session is not available, generate a unique ID
            return str(uuid.uuid4())

    async def check_player_authorization(self):
        """Check if the player is one of the two authorized players for this game"""
        try:
            # Import models here to avoid circular imports
            from .models import Game
            
            # Define an async function to check authorization
            @sync_to_async
            def is_player_authorized():
                try:
                    # Get the game object
                    game = Game.objects.get(room_name=self.room_name, is_active=True)
                    
                    # Check if client is either player 1 or player 2
                    return (game.player1_id == self.client_id or 
                            game.player2_id == self.client_id)
                except Game.DoesNotExist:
                    # Game doesn't exist, but we'll handle this in the connect method
                    return False
                except Exception as e:
                    print(f"Error checking player authorization: {e}")
                    return False
            
            # Call the async function and return the result
            return await is_player_authorized()
        
        except Exception as e:
            print(f"Error in check_player_authorization: {e}")
            return False
