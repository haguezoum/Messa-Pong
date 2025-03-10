import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from django.core.exceptions import ObjectDoesNotExist
from .models import ChatRoom, Message, GameInvite
from .serializers import MessageSerializer, GameInviteSerializer

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            
            
            await self.get_or_create_room()
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            
            await self.send_last_messages()
        except Exception as e:
            await self.close()
            raise StopConsumer()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        except Exception:
            pass

    async def ReceiveJson(self, content):
        try:
            message_type = content.get('type', '')
            handlers = {
                'chat.message': self.HandleChatMessage,
                'game.invite': self.handle_game_invite,
                'game.response': self.handle_game_response
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler(content)
            else:
                await self.send_json({
                    'type': 'error',
                    'message': 'Invalid message type'
                })
        except Exception as e:
            await self.send_json({
                'type': 'error',
                'message': str(e)
            })

    async def HandleChatMessage(self, content):
        try:
            message = await self.save_message(
                username=content['username'],
                message=content['message'],
                room_name=self.room_name
            )
            
            serialized_message = await self.serialize_message(message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'message': serialized_message
                }
            )
        except KeyError:
            await self.send_json({
                'type': 'error',
                'message': 'Invalid message format'
            })

    async def HandleGameInvite(self, content):
        await self.save_game_invite(
            sender=content['sender'],
            receiver=content['receiver'],
            room_name=self.room_name
        )
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game.invite',
                'sender': content['sender'],
                'receiver': content['receiver']
            }
        )

    async def HandleGameResponse(self, content):
        await self.save_game_response(
            sender=content['sender'],
            receiver=content['receiver'],
            room_name=self.room_name,
            response=content['response']
        )

    @database_sync_to_async
    def GetOrCreateRoom(self):
        room, _ = ChatRoom.objects.get_or_create(name=self.room_name)
        return room

    @database_sync_to_async
    def SerializeMessage(self, message):
        return MessageSerializer(message).data

    @database_sync_to_async
    def SaveMessage(self, username, message, room_name):
        room = ChatRoom.objects.get(name=room_name)
        return Message.objects.create(
            room=room,
            username=username,
            content=message
        )

    @database_sync_to_async
    def GetLastMessages(self, limit=50):
        room = ChatRoom.objects.get(name=self.room_name)
        return room.GetMessages(limit)

    async def SendLastMessages(self):
        messages = await self.GetLastMessages()
        serialized_messages = await self.SerializeMessages(messages)
        await self.send_json({
            'type': 'chat.history',
            'messages': serialized_messages
        })

    @database_sync_to_async
    def SerializeMessages(self, messages):
        return MessageSerializer(messages, many=True).data

    @database_sync_to_async
    def SaveGameInvite(self, sender, receiver, room_name):
        room = ChatRoom.objects.get(name=room_name)
        GameInvite.objects.create(
            sender=sender,
            receiver=receiver,
            room=room
        )
        
    @database_sync_to_async
    def SaveGameResponse(self, sender, receiver, room_name, response):
        invite = GameInvite.objects.get(sender=sender, receiver=receiver, room__name=room_name)
        invite.status = response
        invite.save()
