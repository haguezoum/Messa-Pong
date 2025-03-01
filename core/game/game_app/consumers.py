import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.sessions.backends.db import SessionStore
from asgiref.sync import sync_to_async

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"

        # Ensure session key exists and is stored asynchronously
        self.client_id = await self.get_or_create_session()

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'message': message,
                'client_id': self.client_id
            }
        )

    async def game_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'client_id': event['client_id']
        }))

    @sync_to_async
    def get_or_create_session(self):
        """Ensures the session exists and returns its session key."""
        session = self.scope["session"]
        if not session.session_key:
            session.create()  # Creates a new session in DB
        return session.session_key
