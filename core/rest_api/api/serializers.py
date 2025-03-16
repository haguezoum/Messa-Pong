from rest_framework import serializers
from .models import Tuser, Game, Tournament, Message, Conversation, Friendship
from django.contrib.auth.hashers import make_password
from zxcvbn import zxcvbn

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tuser
        fields = ['id', 'username', 'fname', 'lname', 'email', 'bio', 
                 'image', 'score', 'online_status', 'registration_date']
        read_only_fields = ['score', 'registration_date']

    def validate_password(self, value):
        if zxcvbn(value)['score'] < 3:
            raise serializers.ValidationError(
                "Password is too weak. Include uppercase, numbers and symbols."
            )
        return make_password(value)

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'token', 'player_a', 'player_b', 'status',
                 'player_a_score', 'player_b_score', 'created_at']
        read_only_fields = ['token', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at']
        read_only_fields = ['created_at']

class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'created_at']
        read_only_fields = ['created_at']

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return MessageSerializer(last_message).data
        return None

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'code', 'players', 'status', 'admin', 'created_at']
        read_only_fields = ['code', 'created_at'] 
