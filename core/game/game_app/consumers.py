import json
import uuid
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.sessions.backends.db import SessionStore
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from .game_logic import PongGameLogic

class PongConsumer(AsyncWebsocketConsumer):
    game_tasks = {}  # Class variable to store game update tasks
    paused_games = set()  # Track paused games
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"

        # Ensure session key exists and is stored asynchronously
        self.client_id = await self.get_or_create_session()

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        # Create or join game
        game, created = await PongGameLogic.create_or_join_game(self.room_name, self.client_id)
        
        # Send initial game state to the client
        game_state = await sync_to_async(PongGameLogic._get_game_state_dict)(game)
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': game_state,
            'client_id': self.client_id
        }))
        
        # If this is a new full game, start the game loop
        if created or not self.room_name in self.game_tasks:
            self.game_tasks[self.room_name] = asyncio.create_task(self.game_loop())
            
        # Notify all clients about the player joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_joined',
                'client_id': self.client_id,
                'state': game_state
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        # Cleanup any running game task
        if self.room_name in self.game_tasks:
            self.game_tasks[self.room_name].cancel()
            del self.game_tasks[self.room_name]

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
            remaining_time = data.get('remainingTime', 30)
            auto_resumed = data.get('autoResumed', False)
            
            # Log the action
            action = "paused" if is_paused else "resumed"
            auto_str = " (auto)" if auto_resumed else ""
            print(f"Game {action}{auto_str} by {self.client_id if is_paused else paused_by}, room: {self.room_name}")
            
            # Broadcast pause state to all clients
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_paused',
                    'paused': is_paused,
                    'pausedByClientId': paused_by,
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
            while True:
                # Only update game state if not paused
                if self.room_name not in self.paused_games:
                    state = await PongGameLogic.update_game_state(self.room_name)
                    
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_state_update',
                            'state': state
                        }
                    )
                    
                    if state.get('winner_id'):
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'game_over',
                                'winner_id': state.get('winner_id')
                            }
                        )
                        break
                
                # Pause between updates (60 FPS equivalent)
                await asyncio.sleep(1/30)
        except asyncio.CancelledError:
            pass
        finally:
            if self.room_name in self.game_tasks:
                del self.game_tasks[self.room_name]

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
            'remainingTime': event['remainingTime'],
            'autoResumed': event.get('autoResumed', False)
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
