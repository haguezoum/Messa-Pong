from rest_framework import serializers
from .models import Tuser, Game, Tournament, Message, Conversation, Friendship
from django.contrib.auth.hashers import make_password
from zxcvbn import zxcvbn

class   RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tuser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        user = Tuser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=make_password(validated_data['password'])
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tuser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'created_at']
        read_only_fields = ['created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Tuser
        fields = ['username', 'email', 'first_name', 'last_name', 
                 'password', 'confirm_password']

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                'confirm_password': 'Passwords must match.'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = Tuser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

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

class   FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'inviter', 'invitee', 'status', 'created_at']
        read_only_fields = ['created_at']
