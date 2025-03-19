from rest_framework import serializers
from .models import ChatRoom, Message, GameInvite

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'username', 'content', 'timestamp', 'is_game_invite']
        read_only_fields = ['id', 'timestamp']

class GameInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameInvite
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'created_at', 'messages', 'last_message']
        read_only_fields = ['id', 'created_at']
    
    def GetLastMessage(self, obj):
        last_message = obj.messages.order_by('-timestamp').first()
        if last_message:
            return MessageSerializer(last_message).data
        return None 
