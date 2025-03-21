from    rest_framework import serializers
from    .models import *
from    django.conf import settings
from    django.core.validators import validate_email as verify_email
from    django.core.exceptions import ValidationError
from    django.contrib.auth.password_validation import validate_password


""" User Management Serializer """


class   CustomUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class   Meta:
        models.CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'avatar', 'avatar_urls', 'online_status')
        extra_kwargs = {'password': {'write_only': True}}

    def GetAvatarUrl(self, obj):
        if obj.avatar:
            return settings.DOMAIN + obj.avatar_url
        else:
            return None

    def Internal_value(self, data):
        if 'email' in data and not data['email']:
            raise serializers.ValidationError({'email': ['Email is required.']})
        if 'password' in data and not data['password']:
            raise serializers.ValidationError({'password': ['Password is required.']})
        if 'username' in data and not data['username']:
            raise serializers.ValidationError({'username': ['Username is required.']})
        if 'email' in data:
            try:
                verify_email(data['email'])
            except ValidationError:
                raise serializers.ValidationError({'email': ['Invalid email address.']})
        if 'password' in data:
            try:
                validate_password(data['password'])
            except ValidationError as e:
                raise serializers.ValidationError({'password': list(e.messages)})
        return super().Internal_value(data)

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get('avatar', instance.avatar)

        if 'email' in validated_data:
            email = CustomUser.objects.normalize_email(validated_data['email'])
            try:
                verify_email(email)
            except ValidationError:
                raise serializers.ValidationError({'email': ['Are you sure this is a valid email?']})
            if CustomUser.objects.filter(email=email).exclude(id=instance.id).exists():
                raise serializers.ValidationError({'email': ['Email is already in use.']})
            instance.email = email

        if 'username' in validated_data:
            if CustomUser.objects.filter(username=validated_data['username']).exclude(id=instance.id).exists():
                raise serializers.ValidationError({'username': ['Username is already in use.']})
            instance.username = validated_data['username']
        
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance


""" Game and Tournament Serializer """


class   AIMatchSerializer(serializers.ModelSerializer):
    class   Meta:
        model = AIMatch
        fields = ('player', 'ai_level', 'winner', 'score', 'match_duration', 'match_date', 'user')


class   PvPMatchSerializer(serializers.ModelSerializer):
    class   Meta:
        model = PvPMatch
        fields = ('player_one', 'player_two', 'winner', 'score', 'match_duration', 'match_date', 'user')


class   TournamentSerializer(serializers.ModelSerializer):
    class   Meta:
        model = Tournament
        fields = ('player_one', 'player_two', 'player_three', 'player_four', 'winner', 'duration', 'date', 'user')


class   UserGameStatsSerializer(serializers.ModelSerializer):
    total_games = serializers.IntegerField()
    time_played = serializers.IntegerField()
    total_ai_games = serializers.IntegerField()
    total_pvp_games = serializers.IntegerField()
    total_tournament_played = serializers.IntegerField()
    
    class   Meta:
        model = UserGameStats
        fields = ('total_games', 'time_played', 'total_ai_games', 'total_pvp_games', 'total_tournament_played')
