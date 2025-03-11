from ninja import Router
from ninja.errors import HttpError
from django.db.models import Q, F
from django.utils import timezone
from rest_api.models import Tuser, Game
from .jwt import UserJWTAuth, AdminJWTAuth
from .schemas import (
    GameSchema,
    GameCreateSchema,
    GameJoinSchema,
    GameScoreSchema,
    LeaderboardSchema
)
import logging

router = Router()
logger = logging.getLogger(__name__)

@router.post("/games", auth=UserJWTAuth(), response=GameSchema)
def create_game(request):
    """Create a new game session"""
    user = request.auth
    if user.game_status != Tuser.Status.AFK:
        raise HttpError(400, "Already in a game")
    game = Game.objects.create(
        player_a=user,
        token=Game.generate_token(),
        status=Game.Status.WAITING
    )
    user.game_status = Tuser.Status.PLAYING
    user.save()
    return {
        "token": game.token,
        "status": game.get_status_display(),
        "player_a": user.username,
        "created_at": game.created_at
    }

@router.post("/games/{token}/join", auth=UserJWTAuth(), response=GameSchema)
def join_game(request, token: str):
    """Join an existing game session"""
    user = request.auth
    game = get_object_or_404(Game, token=token)
    if user == game.player_a:
        raise HttpError(400, "Cannot play against yourself")
    if game.status != Game.Status.WAITING:
        raise HttpError(400, "Game is not joinable")
    if user.game_status != Tuser.Status.AFK:
        raise HttpError(400, "Already in a game")
    game.player_b = user
    game.status = Game.Status.ONGOING
    game.save()
    user.game_status = Tuser.Status.PLAYING
    user.save()
    return {
        "token": game.token,
        "status": game.get_status_display(),
        "players": [game.player_a.username, game.player_b.username]
    }

@router.post("/games/{token}/score", auth=UserJWTAuth(), response=GameScoreSchema)
def update_score(request, token: str, scorer: str):
    """Update game score (scorer: 'a' or 'b')"""
    game = get_object_or_404(Game, token=token)
    if game.status != Game.Status.ONGOING:
        raise HttpError(400, "Game is not active")
    if scorer not in ['a', 'b']:
        raise HttpError(400, "Invalid scorer")
    if scorer == 'a':
        game.score_a = F('score_a') + 1
    else:
        game.score_b = F('score_b') + 1
    game.save(update_fields=['score_a', 'score_b'])
    return {
        "token": game.token,
        "current_score": {
            "a": game.score_a,
            "b": game.score_b
        }
    }

@router.post("/games/{token}/finish", auth=AdminJWTAuth())
def finish_game(request, token: str):
    """Finalize game results and update rankings"""
    game = get_object_or_404(Game, token=token)
    if game.status != Game.Status.ONGOING:
        raise HttpError(400, "Game is not active")
    a_win = game.score_a > game.score_b
    game.player_a.update_score(game.score_a, a_win)
    game.player_b.update_score(game.score_b, not a_win)
    game.status = Game.Status.COMPLETED
    game.save()

    game.player_a.game_status = Tuser.Status.AFK
    game.player_b.game_status = Tuser.Status.AFK
    game.player_a.save()
    game.player_b.save()
    return {"success": "Game results recorded"}

@router.get("/games/{token}", auth=UserJWTAuth(), response=GameSchema)
def game_info(request, token: str):
    """Get detailed game information"""
    game = get_object_or_404(Game, token=token)
    return {
        "token": game.token,
        "status": game.get_status_display(),
        "players": {
            "a": game.player_a.username,
            "b": game.player_b.username if game.player_b else None
        },
        "scores": {
            "a": game.score_a,
            "b": game.score_b
        },
        "created_at": game.created_at
    }

@router.get("/leaderboard", auth=UserJWTAuth(), response=list[LeaderboardSchema])
def global_leaderboard(request):
    """Global player rankings"""
    return Tuser.objects.order_by('-score')[:100]

@router.get("/friends-leaderboard", auth=UserJWTAuth(), response=list[LeaderboardSchema])
def friends_leaderboard(request):
    """Friends-only rankings"""
    user = request.auth
    return user.friends.order_by('-score')[:100]

@router.get("/match-history", auth=UserJWTAuth(), response=list[GameSchema])
def match_history(request):
    """User's game history"""
    user = request.auth
    return Game.objects.filter(
        Q(player_a=user) | Q(player_b=user)
    ).order_by('-created_at')[:50]
