from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Tournament, TournamentRound, Game, Tuser
from ..serializers import TournamentSerializer
from ..permissions import IsVerifiedUser
import binascii
import os
import math
import random

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    @action(detail=False, methods=['post'])
    def create_tournament(self, request):
        user = request.user
        admin_alias = request.data.get('admin_alias')

        if user.tournament_code:
            return Response({
                'error': 'Already hosting a tournament'
            }, status=status.HTTP_400_BAD_REQUEST)

        tournament = Tournament.objects.create(
            code=binascii.hexlify(os.urandom(11)).decode(),
            admin=user,
            status=Tournament.Status.WAITING
        )
        
        user.tournament_alias = admin_alias
        user.tournament_code = tournament.code
        tournament.players.add(user)
        user.save()

        return Response({'success': tournament.code})

    @action(detail=False, methods=['post'])
    def start_tournament(self, request):
        user = request.user
        tournament = Tournament.objects.filter(code=user.tournament_code).first()

        if not tournament or tournament.admin != user:
            return Response({
                'error': 'Not tournament admin'
            }, status=status.HTTP_403_FORBIDDEN)

        player_count = tournament.players.count()
        if not self._is_power_of_two(player_count) or player_count < 4:
            return Response({
                'error': 'Invalid number of players'
            }, status=status.HTTP_400_BAD_REQUEST)

        if tournament.status != Tournament.Status.WAITING:
            return Response({
                'error': 'Tournament already started or finished'
            }, status=status.HTTP_400_BAD_REQUEST)

        players = list(tournament.players.all())
        random.shuffle(players)
        
        first_round = TournamentRound.objects.create(
            tournament=tournament,
            number=1
        )

        for i in range(0, len(players), 2):
            game = Game.objects.create(
                player_a=players[i],
                player_b=players[i+1],
                token=binascii.hexlify(os.urandom(10)).decode()
            )
            first_round.games.add(game)

        tournament.status = Tournament.Status.ONGOING
        tournament.save()

        return Response({'success': 'Tournament started'})

    def _is_power_of_two(self, n):
        return n > 0 and (n & (n - 1)) == 0 
