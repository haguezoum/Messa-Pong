from ninja import Router
from ninja.errors import HttpError
from django.db import transaction
from django.db.models import Q, Prefetch
from django.utils import timezone
from rest_api.models import Tuser, Tournament, Game, TournamentRound
from .jwt import UserJWTAuth, AdminJWTAuth
from .schemas import (
    TournamentSchema,
    TournamentCreateSchema,
    TournamentStatusSchema,
    RoundSchema
)
import logging
import math
from random import shuffle

router = Router()
logger = logging.getLogger(__name__)

@router.post("/tournaments", auth=UserJWTAuth(), response=TournamentCreateSchema)
def create_tournament(request, alias: str):
    """Create a new tournament"""
    user = request.auth
    if user.tournament:
        raise HttpError(400, "Already hosting a tournament")
    tournament = Tournament.objects.create(
        admin=user,
        code=Tournament.generate_code(),
        status=Tournament.Status.WAITING
    )
    user.tournament_alias = alias
    user.tournament_code = tournament.code
    user.save()
    return {
        "code": tournament.code,
        "admin": user.username,
        "status": tournament.get_status_display()
    }

@router.post("/tournaments/{code}/join", auth=UserJWTAuth())
def join_tournament(request, code: str):
    """Join an existing tournament"""
    tournament = get_object_or_404(Tournament, code=code)
    if tournament.status != Tournament.Status.WAITING:
        raise HttpError(400, "Tournament not accepting players")
    if tournament.players.count() >= settings.MAX_TOURNAMENT_PLAYERS:
        raise HttpError(400, "Tournament full")
    user = request.auth
    tournament.players.add(user)
    user.tournament_code = code
    user.save()
    return {"success": "Joined tournament"}

@router.post("/tournaments/{code}/start", auth=AdminJWTAuth())
def start_tournament(request, code: str):
    """Start the tournament (admin only)"""
    tournament = get_object_or_404(Tournament, code=code)
    if tournament.admin != request.auth:
        raise HttpError(403, "Only admin can start tournament")
    player_count = tournament.players.count()
    if not math.log2(player_count).is_integer():
        raise HttpError(400, "Player count must be power of 2")
    with transaction.atomic():
        tournament.status = Tournament.Status.ONGOING
        tournament.save()
        players = list(tournament.players.all())
        shuffle(players)
        first_round = TournamentRound.objects.create(
            tournament=tournament,
            round_number=1
        )
        for i in range(0, len(players), 2):
            Game.objects.create(
                tournament_round=first_round,
                player_a=players[i],
                player_b=players[i+1],
                token=Game.generate_token()
            )
    return {"success": "Tournament started"}

@router.get("/tournaments/{code}/status", auth=UserJWTAuth(), response=TournamentStatusSchema)
def tournament_status(request, code: str):
    """Get tournament status and user participation info"""
    tournament = get_object_or_404(Tournament, code=code)
    user = request.auth
    current_round = tournament.current_round
    user_game = current_round.games.filter(
        Q(player_a=user) | Q(player_b=user)
    ).first() if current_round else None
    return {
        "status": tournament.get_status_display(),
        "current_round": current_round.round_number if current_round else None,
        "user_match": user_game.token if user_game else None,
        "participants": tournament.players.count()
    }

@router.post("/tournaments/{code}/next-round", auth=AdminJWTAuth())
def advance_tournament(request, code: str):
    """Advance to next round (admin only)"""
    tournament = get_object_or_404(Tournament, code=code)
    if tournament.admin != request.auth:
        raise HttpError(403, "Only admin can advance rounds")
    current_round = tournament.current_round
    if not current_round.is_completed:
        raise HttpError(400, "Current round not completed")
    winners = current_round.get_winners()
    if len(winners) < 2:
        tournament.status = Tournament.Status.COMPLETED
        tournament.save()
        return {"success": "Tournament completed"}
    with transaction.atomic():
        new_round = TournamentRound.objects.create(
            tournament=tournament,
            round_number=current_round.round_number + 1
        )
        shuffle(winners)
        for i in range(0, len(winners), 2):
            Game.objects.create(
                tournament_round=new_round,
                player_a=winners[i],
                player_b=winners[i+1],
                token=Game.generate_token()
            )
    return {"success": f"Round {new_round.round_number} started"}

@router.post("/tournaments/{code}/abort", auth=AdminJWTAuth())
def abort_tournament(request, code: str):
    """Abort tournament (admin only)"""
    tournament = get_object_or_404(Tournament, code=code)
    if tournament.admin != request.auth:
        raise HttpError(403, "Only admin can abort tournament")
    with transaction.atomic():
        tournament.delete()
    return {"success": "Tournament aborted"}

@router.get("/tournaments", auth=UserJWTAuth(), response=list[TournamentSchema])
def list_tournaments(request):
    """List user's tournaments"""
    user = request.auth
    return Tournament.objects.filter(
        Q(players=user) | Q(admin=user)
    ).prefetch_related('players').order_by('-created_at')

@router.get("/tournaments/{code}/details", auth=UserJWTAuth(), response=TournamentSchema)
def tournament_details(request, code: str):
    """Get detailed tournament information"""
    tournament = get_object_or_404(Tournament, code=code)
    return tournament
