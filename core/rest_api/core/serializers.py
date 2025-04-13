from rest_framework import serializers
from .models import User, FriendRequest, Friendship, Game, Message, UserBlock

class UserSerializer(serializers.ModelSerializer):
    win_rate = serializers.ReadOnlyField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                  'profile_picture', 'is_2fa_enabled', 'profile_picture_url', 
                  'total_games', 'wins', 'losses', 'draws', 'win_rate', 'oauth_42_id']
        extra_kwargs = {'password': {'write_only': True}, 'oauth_42_id': {'read_only': True}}

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url)
        return request.build_absolute_uri('/media/profile_pics/default.jpg')

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)


class PublicUserSerializer(serializers.ModelSerializer):
    win_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture', 'total_games', 'wins', 'losses', 'draws', 'win_rate']


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    to_user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'to_user_id', 'status', 'created_at']
        
    def create(self, validated_data):
        to_user_id = validated_data.pop('to_user_id')
        to_user = User.objects.get(id=to_user_id)
        return FriendRequest.objects.create(to_user=to_user, **validated_data)


class FriendshipSerializer(serializers.ModelSerializer):
    friend = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ['id', 'friend', 'since']


class GameSerializer(serializers.ModelSerializer):
    players = UserSerializer(many=True, read_only=True)
    winner = UserSerializer(read_only=True)
    
    class Meta:
        model = Game
        fields = ['id', 'players', 'winner', 'start_time', 'end_time']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'recipient_id', 'content', 'timestamp', 'is_emoji']
        
    def create(self, validated_data):
        recipient_id = validated_data.pop('recipient_id')
        recipient = User.objects.get(id=recipient_id)
        user = self.context['request'].user
        
        # Create the message with proper recipient linking
        message = Message.objects.create(
            sender=user,
            recipient=recipient,
            content=validated_data.get('content'),
            is_emoji=validated_data.get('is_emoji', False)
        )
        return message


class UserBlockSerializer(serializers.ModelSerializer):
    blocked_user = UserSerializer(read_only=True)
    blocked_user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserBlock
        fields = ['id', 'blocked_user', 'blocked_user_id', 'created_at']
        
    def create(self, validated_data):
        blocked_user_id = validated_data.pop('blocked_user_id')
        blocked_user = User.objects.get(id=blocked_user_id)
        return UserBlock.objects.create(blocked_user=blocked_user, **validated_data)
