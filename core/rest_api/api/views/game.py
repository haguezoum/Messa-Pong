from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Game, Tuser
from django.db.models import models, Q
from ..serializers import GameSerializer, UserSerializer
from ..permissions import IsVerifiedUser, IsAdmin
import binascii
import os

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    @action(detail=False, methods=['post'])
    def create_game(self, request):
        user = request.user
        if user.game_status == Tuser.GameStatus.PLAYING:
            return Response({
                'error': 'Cannot create game while playing another'
            }, status=status.HTTP_400_BAD_REQUEST)

        game = Game.objects.create(
            player_a=user,
            token=binascii.hexlify(os.urandom(11)).decode(),
            status=Game.Status.WAITING
        )
        user.game_status = Tuser.GameStatus.PLAYING
        user.save()

        return Response({
            'success': game.token
        })

    @action(detail=False, methods=['post'])
    def register_to_game(self, request):
        game_token = request.data.get('game_token')
        user = request.user

        game = Game.objects.filter(token=game_token).first()
        if not game:
            return Response({
                'error': 'Game not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if game.status != Game.Status.WAITING:
            return Response({
                'error': 'Game already started or finished'
            }, status=status.HTTP_400_BAD_REQUEST)

        if game.player_a == user:
            return Response({
                'error': 'Cannot play against yourself'
            }, status=status.HTTP_400_BAD_REQUEST)

        game.player_b = user
        game.status = Game.Status.ONGOING
        game.save()

        user.game_status = Tuser.GameStatus.PLAYING
        user.save()

        return Response({'success': 'Game starting'})

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def register_goal(self, request):
        game_token = request.data.get('game_token')
        scorer_id = request.data.get('scorer_id')

        game = Game.objects.filter(token=game_token).first()
        if not game or game.status == Game.Status.DONE:
            return Response({
                'error': 'Invalid game'
            }, status=status.HTTP_400_BAD_REQUEST)

        if scorer_id == game.player_a.id:
            game.player_a_score += 1
        elif scorer_id == game.player_b.id:
            game.player_b_score += 1
        else:
            return Response({
                'error': 'Invalid scorer'
            }, status=status.HTTP_400_BAD_REQUEST)

        game.save()
        return Response({'success': 'Score registered'})

    @action(detail=False, methods=['get'])
    def match_history(self, request):
        user_id = request.query_params.get('user_id')
        user = Tuser.objects.get(id=user_id)
        
        games = Game.objects.filter(
            status=Game.Status.DONE
        ).filter(
            models.Q(player_a=user) | models.Q(player_b=user)
        )

        return Response(GameSerializer(games, many=True).data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        users = Tuser.objects.all().order_by('-score')[:10]
        return Response(UserSerializer(users, many=True).data) 
