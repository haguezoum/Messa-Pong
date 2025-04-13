import json
import urllib.parse
import traceback
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, User
from rest_framework_simplejwt.tokens import AccessToken
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Get the room name from the URL route
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            
            logger.info(f"WebSocket connection attempt to room: {self.room_name}")
            
            # Get token from query string
            query_string = self.scope.get('query_string', b'').decode('utf-8')
            query_params = dict(urllib.parse.parse_qsl(query_string))
            token = query_params.get("token", "")
            
            if token:
                try:
                    # Decode and validate the token
                    decoded_token = AccessToken(token)
                    user_id = decoded_token['user_id']
                    
                    # Store user ID in scope for later use
                    self.scope['user_id'] = user_id
                    self.user_id = user_id
                    
                    # Add to group and accept connection
                    await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                    await self.accept()
                    
                    # Log successful connection
                    logger.info(f"WebSocket connection accepted for user {user_id} in room {self.room_name}")
                    
                    # Try to get user info for the welcome message
                    try:
                        user = await self.get_user_by_id(user_id)
                        username = user.username if user else 'Unknown'
                    except Exception as user_error:
                        logger.error(f"Error getting user info: {str(user_error)}")
                        username = 'Unknown'
                    
                    # Send a welcome message to confirm connection
                    await self.send(text_data=json.dumps({
                        'message': 'Connected to chat server',
                        'status': 'connected',
                        'room': self.room_name,
                        'user_id': user_id,
                        'username': username
                    }))
                    
                except Exception as auth_error:
                    logger.error(f"Token authentication error: {str(auth_error)}")
                    logger.error(traceback.format_exc())
                    await self.close(code=4001)  # Authentication Failed
            else:
                logger.error("No token provided in WebSocket connection")
                await self.close(code=4001)  # Authentication Failed
        except Exception as e:
            logger.error(f"Unexpected error in WebSocket connect: {str(e)}")
            logger.error(traceback.format_exc())
            await self.close(code=1011)  # Internal Error


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"User disconnected from room {self.room_name}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('message')
            
            if not message:
                logger.error("Received message with no content")
                await self.send(text_data=json.dumps({
                    'error': 'Message content is required',
                    'status': 'error'
                }))
                return
                
            # Get sender ID from the authenticated user or from message data
            sender_id = getattr(self, 'user_id', None) or data.get('sender_id')
            if not sender_id:
                logger.error("No sender ID available")
                await self.send(text_data=json.dumps({
                    'error': 'Sender ID is required',
                    'status': 'error'
                }))
                return
                
            # Get recipient ID from message data
            recipient_id = data.get('recipient_id')
            if not recipient_id:
                logger.error(f"No recipient_id provided in message data")
            
            if not recipient_id:
                logger.error(f"No recipient_id could be determined for message in room {self.room_name}")
                await self.send(text_data=json.dumps({
                    'error': 'No recipient specified',
                    'status': 'error'
                }))
                return
            
            # Additional logging to track message flow
            logger.info(f"Processing message in room {self.room_name} from {sender_id} to {recipient_id}")
            
            # Save message to database
            try:
                message_obj = await database_sync_to_async(Message.objects.create)(
                    sender_id=sender_id,
                    recipient_id=recipient_id,
                    content=message,
                    is_emoji=data.get('is_emoji', False)
                )
                
                # Format timestamp for JSON
                timestamp = await database_sync_to_async(lambda: message_obj.timestamp.isoformat())()
                message_id = await database_sync_to_async(lambda: message_obj.id)()
                
                logger.info(f"Message saved to database with ID: {message_id}")
                
                # Get sender info to include in the message
                sender = await self.get_user_by_id(sender_id)
                sender_username = await database_sync_to_async(lambda: sender.username if sender else 'Unknown')()
                
                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'message_id': message_id,
                        'sender_id': sender_id,
                        'sender_username': sender_username,
                        'recipient_id': recipient_id,
                        'timestamp': timestamp,
                        'is_emoji': data.get('is_emoji', False)
                    }
                )
                
                # Send confirmation to the sender
                await self.send(text_data=json.dumps({
                    'status': 'sent',
                    'message_id': message_id,
                }))
            except Exception as db_error:
                logger.error(f"Database error when saving message: {str(db_error)}")
                logger.error(traceback.format_exc())
                # Send error to the client
                await self.send(text_data=json.dumps({
                    'error': 'Failed to save message',
                    'status': 'error'
                }))
            
            logger.info(f"Message sent in room {self.room_name}: {message[:20]}...")
            
        except Exception as e:
            logger.error(f"Error in WebSocket receive: {str(e)}")
            logger.error(traceback.format_exc())
            await self.send(text_data=json.dumps({
                'error': str(e),
                'status': 'error'
            }))
    
    # Handler for messages broadcast to the group
    @database_sync_to_async
    def get_user_by_id(self, user_id):
        """Get user by ID from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {str(e)}")
            return None

    async def chat_message(self, event):
        """Send message to WebSocket when received from group"""
        try:
            # Send message to WebSocket client with all available information
            message_data = {
                'type': 'chat_message',
                'message': event['message'],
                'sender_id': event['sender_id'],
                'recipient_id': event['recipient_id'],
                'timestamp': event['timestamp'],
                'is_emoji': event['is_emoji']
            }
            
            # Add additional fields if available
            if 'message_id' in event:
                message_data['message_id'] = event['message_id']
            if 'sender_username' in event:
                message_data['sender_username'] = event['sender_username']
                
            await self.send(text_data=json.dumps(message_data))
            
            logger.info(f"Message broadcast to client in room {self.room_name}")
        except Exception as e:
            logger.error(f"Error broadcasting message: {str(e)}")
            logger.error(traceback.format_exc())

    @database_sync_to_async
    def get_user(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
            
    @database_sync_to_async
    def get_user_by_id(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error getting user by ID {user_id}: {str(e)}")
            return None

    @database_sync_to_async
    def save_message(self, sender, recipient, content, is_emoji):
        return Message.objects.create(
            sender=sender,
            recipient=recipient,
            content=content,
            is_emoji=is_emoji
        )
