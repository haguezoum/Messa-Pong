from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.http import require_POST
from django.urls import reverse
import uuid
import random
import string
from datetime import timedelta
from django.utils import timezone

from .models import Game, PlayerQueue, GameState
from .game_logic import PongGameLogic

# Create your views here.
def clean_old_queue_entries():
    """Clean up old queue entries that might be orphaned"""
    # Delete unmatched queue entries older than 15 minutes
    old_time = timezone.now() - timedelta(minutes=15)
    PlayerQueue.objects.filter(
        is_matched=False, 
        joined_at__lt=old_time
    ).delete()
    
    # Delete matched queue entries without a valid game
    PlayerQueue.objects.filter(
        is_matched=True, 
        game__isnull=True
    ).delete()
    
    # Also, clean up matched entries where the game is no longer active
    PlayerQueue.objects.filter(
        is_matched=True,
        game__is_active=False
    ).delete()

def game_view(request, room_name=None):
    """View for the game page with a specific room name"""
    # If no room name provided, redirect to lobby
    if not room_name:
        return redirect('game_lobby')
    
    # Check if the game exists
    try:
        game = Game.objects.get(room_name=room_name, is_active=True)
        
        # Check if game has a state, if not initialize it
        try:
            state = game.state
        except Game.state.RelatedObjectDoesNotExist:
            # If state doesn't exist, initialize it
            PongGameLogic._initialize_game_state(game)
            
    except Game.DoesNotExist:
        # Game not found, redirect to lobby
        return redirect('game_lobby')
    
    context = {
        'room_name': room_name,
    }
    return render(request, 'index.html', context)

def game_lobby(request):
    """View for the game lobby page"""
    # Clean up old queue entries first
    clean_old_queue_entries()
    
    # Count active players and games
    active_games = Game.objects.filter(is_active=True).count()
    active_players = PlayerQueue.objects.filter(is_matched=False).count()
    
    context = {
        'active_players': active_players,
        'active_games': active_games,
    }
    return render(request, 'lobby.html', context)

def join_queue(request):
    """Add player to the matchmaking queue"""
    # Ensure we have a session for the user
    if not request.session.session_key:
        request.session.create()
    
    client_id = request.session.session_key
    
    # Check if player is already in any queue (matched or unmatched)
    existing_entry = PlayerQueue.objects.filter(player_id=client_id).first()
    
    if existing_entry:
        # If player is already matched to a game, redirect to that game
        if existing_entry.is_matched and existing_entry.game:
            return redirect('game_with_room', room_name=existing_entry.game.room_name)
        # If player is already in an unmatched queue, redirect to waiting
        elif not existing_entry.is_matched:
            return redirect('waiting_room')
        # If player was matched but the game is no longer available, clean up and continue
        else:
            existing_entry.delete()
    
    # Look for another player waiting in the queue
    waiting_player = PlayerQueue.objects.filter(
        is_matched=False
    ).exclude(player_id=client_id).order_by('joined_at').first()
    
    if waiting_player:
        # We have a match! Create a game room
        room_name = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        
        # Create game with both players
        game = Game.objects.create(
            room_name=room_name,
            player1_id=waiting_player.player_id,
            player2_id=client_id,
        )
        
        # Initialize game state
        PongGameLogic._initialize_game_state(game)
        
        # Update queue entries
        waiting_player.is_matched = True
        waiting_player.game = game
        waiting_player.save()
        
        # Create a new queue entry for this player
        queue_entry = PlayerQueue.objects.create(
            player_id=client_id,
            is_matched=True,
            game=game
        )
        
        # Redirect to the game
        return redirect('game_with_room', room_name=room_name)
    
    # No match yet, add to queue and go to waiting room
    PlayerQueue.objects.create(
        player_id=client_id,
        is_matched=False
    )
    
    return redirect('waiting_room')

def waiting_room(request):
    """View for waiting room while player is in queue"""
    if not request.session.session_key:
        request.session.create()
        
    client_id = request.session.session_key
    
    # Count active players and games
    active_games = Game.objects.filter(is_active=True).count()
    active_players = PlayerQueue.objects.filter(is_matched=False).count() + active_games * 2
    
    # Check if player is in queue
    queue_entry = PlayerQueue.objects.filter(player_id=client_id).first()
    
    # If not in queue at all, redirect to lobby
    if not queue_entry:
        return redirect('game_lobby')
    
    # If already matched, redirect to game
    if queue_entry.is_matched and queue_entry.game:
        return redirect('game_with_room', room_name=queue_entry.game.room_name)
    
    # If queue entry shows matched but game is missing or deleted, clean up and restart
    if queue_entry.is_matched and not queue_entry.game:
        queue_entry.delete()
        return redirect('game_lobby')
    
    # Get queue position (1-indexed)
    try:
        queue_position = list(PlayerQueue.objects.filter(
            is_matched=False
        ).order_by('joined_at').values_list('id', flat=True)).index(queue_entry.id) + 1
    except (ValueError, IndexError):
        # If we can't find position (shouldn't happen), default to position 1
        queue_position = 1
    
    context = {
        'queue_position': queue_position,
        'active_players': active_players,
        'active_games': active_games,
    }
    return render(request, 'waiting.html', context)

def check_queue_status(request):
    """AJAX endpoint to check queue status"""
    if not request.session.session_key:
        return JsonResponse({'error': 'No session'}, status=400)
        
    client_id = request.session.session_key
    
    # Count active players and games
    active_games = Game.objects.filter(is_active=True).count()
    active_players = PlayerQueue.objects.filter(is_matched=False).count() + active_games * 2
    
    # Check if player is in queue (any state)
    queue_entry = PlayerQueue.objects.filter(player_id=client_id).first()
    if not queue_entry:
        return JsonResponse({'error': 'Not in queue'}, status=400)
    
    # If matched, check if game has a valid state
    if queue_entry.is_matched and queue_entry.game:
        # Check if the game has a state, if not initialize it
        try:
            # Access state to trigger the exception if it doesn't exist
            state = queue_entry.game.state
        except Game.state.RelatedObjectDoesNotExist:
            # If state doesn't exist, initialize it
            PongGameLogic._initialize_game_state(queue_entry.game)
        
        # Now redirect to the game
        game_url = reverse('game_with_room', kwargs={'room_name': queue_entry.game.room_name})
        return JsonResponse({
            'matched': True,
            'game_url': game_url,
            'position': 0,
            'active_players': active_players,
            'active_games': active_games
        })
    
    # If marked as matched but game is missing, clean up and indicate user should reload
    if queue_entry.is_matched and not queue_entry.game:
        queue_entry.delete()
        return JsonResponse({
            'reload': True,
            'active_players': active_players,
            'active_games': active_games
        })
    
    # Get queue position (1-indexed)
    try:
        queue_position = list(PlayerQueue.objects.filter(
            is_matched=False
        ).order_by('joined_at').values_list('id', flat=True)).index(queue_entry.id) + 1
    except (ValueError, IndexError):
        # If we can't find position (shouldn't happen), default to position 1
        queue_position = 1
    
    return JsonResponse({
        'matched': False,
        'position': queue_position,
        'active_players': active_players,
        'active_games': active_games
    })

def leave_queue(request):
    """Remove player from queue"""
    if not request.session.session_key:
        return redirect('game_lobby')
        
    client_id = request.session.session_key
    
    # Remove from queue (any state)
    PlayerQueue.objects.filter(player_id=client_id).delete()
    
    return redirect('game_lobby')

