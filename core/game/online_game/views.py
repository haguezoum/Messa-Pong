from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib.sessions.backends.db import SessionStore
from django.views.decorators.http import require_POST
from django.urls import reverse
import uuid
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Game, PlayerQueue, GameState, is_system_at_capacity
from .game_logic import PongGameLogic

# Create your views here.
def clean_old_queue_entries():
    """Clean up old queue entries and inactive games"""
    # Delete unmatched queue entries older than 3 minutes (reduced from 5)
    old_time = timezone.now() - timedelta(minutes=3)
    deleted_entries = PlayerQueue.objects.filter(
        is_matched=False, 
        joined_at__lt=old_time
    ).delete()
    
    # Delete matched queue entries without a valid game
    deleted_invalid = PlayerQueue.objects.filter(
        is_matched=True, 
        game__isnull=True
    ).delete()
    
    # Clean up matched entries where the game is no longer active
    deleted_inactive = PlayerQueue.objects.filter(
        is_matched=True,
        game__is_active=False
    ).delete()
    
    # Clean up games that have been inactive for too long (10 minutes - reduced from 15)
    old_game_time = timezone.now() - timedelta(minutes=10)
    inactive_games = Game.objects.filter(
        last_updated__lt=old_game_time
    ).update(is_active=False)
    
    # Clean up games without any players
    orphaned_count = 0
    for game in Game.objects.filter(is_active=True):
        has_queue_entries = PlayerQueue.objects.filter(game=game).exists()
        if not has_queue_entries:
            game.is_active = False
            game.save()
            orphaned_count += 1
    
    # Force active games to have exactly 2 players or be marked inactive
    for game in Game.objects.filter(is_active=True):
        player_count = PlayerQueue.objects.filter(game=game).count()
        if player_count != 2:
            game.is_active = False
            game.save()
            # Also remove any queue entries for this game
            PlayerQueue.objects.filter(game=game).delete()
    
    # CRITICAL: Make sure we never exceed 2 players total in the system
    total_player_count = PlayerQueue.objects.count()
    if total_player_count > 2:
        # If we somehow have more than 2 players, keep only the two oldest entries
        # This is a fallback protection that should rarely if ever be needed
        keep_players = PlayerQueue.objects.order_by('joined_at')[:2]
        if keep_players.exists():
            keep_ids = [player.id for player in keep_players]
            PlayerQueue.objects.exclude(id__in=keep_ids).delete()
            print("⚠️ CRITICAL: Found more than 2 players in the system, removed excess entries!")
    
    print(f"Cleanup: Removed {deleted_entries[0] if deleted_entries else 0} old waiting entries, " +
          f"{deleted_invalid[0] if deleted_invalid else 0} invalid entries, " +
          f"{deleted_inactive[0] if deleted_inactive else 0} inactive game entries, " +
          f"{inactive_games} old games, {orphaned_count} orphaned games")

def game_view(request, room_name=None):
    """View for the game page with a specific room name"""
    # If no room name provided, redirect to lobby
    if not room_name:
        return redirect('game_lobby')
    
    # Ensure we have a session for the user
    if not request.session.session_key:
        request.session.create()
    
    client_id = request.session.session_key
    
    # Check if the game exists
    try:
        game = Game.objects.get(room_name=room_name, is_active=True)
        
        # Check if this player is authorized to join this game
        if game.player1_id != client_id and game.player2_id != client_id:
            # This player is not authorized for this game, redirect to lobby with message
            if hasattr(request, 'session'):
                request.session['lobby_message'] = "You are not authorized to join this game. Only the two matched players can access it."
            return redirect('game_lobby')
        
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
    
    # CRITICAL: Special emergency check to ensure we never exceed 2 players
    total_player_count = PlayerQueue.objects.count()
    if total_player_count > 2:
        # If we somehow have more than 2 players, keep only the two oldest entries
        keep_players = PlayerQueue.objects.order_by('joined_at')[:2]
        if keep_players.exists():
            keep_ids = [player.id for player in keep_players]
            PlayerQueue.objects.exclude(id__in=keep_ids).delete()
            print("⚠️ CRITICAL: Found more than 2 players in the system during lobby load, removed excess entries!")
    
    # Get current capacity status
    at_capacity = is_system_at_capacity()
    
    # Count active players and games
    active_games = Game.objects.filter(is_active=True).count()
    active_players = PlayerQueue.objects.filter(is_matched=False).count() + active_games * 2
    
    # Check for any messages in the session
    lobby_message = None
    if hasattr(request, 'session') and 'lobby_message' in request.session:
        lobby_message = request.session['lobby_message']
        # Clear the message after retrieving it
        del request.session['lobby_message']
    
    context = {
        'active_players': active_players,
        'active_games': active_games,
        'message': lobby_message,
        'at_capacity': at_capacity,
    }
    return render(request, 'lobby.html', context)

def join_queue(request):
    """Add player to the matchmaking queue"""
    # Run cleanup to ensure player counts are accurate
    clean_old_queue_entries()
    
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
    
    # CRITICAL: Check definitively if we're at capacity of 2 players
    # We MUST NOT allow more than 2 players total
    if is_system_at_capacity():
        # Add a clear message to the session
        if hasattr(request, 'session'):
            request.session['lobby_message'] = "SYSTEM AT CAPACITY: Maximum player limit reached (2 players). Please try again later when space opens up."
        
        return redirect('game_lobby')
    
    # If we're here, there's room for this player
    
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
    # Run cleanup to ensure we have accurate player counts
    clean_old_queue_entries()
    
    # CRITICAL: Special emergency check to ensure we never exceed 2 players
    total_player_count = PlayerQueue.objects.count()
    if total_player_count > 2:
        # If we somehow have more than 2 players, keep only the two oldest entries
        keep_players = PlayerQueue.objects.order_by('joined_at')[:2]
        if keep_players.exists():
            keep_ids = [player.id for player in keep_players]
            PlayerQueue.objects.exclude(id__in=keep_ids).delete()
            print("⚠️ CRITICAL: Found more than 2 players in the system during waiting room load, removed excess entries!")
    
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

@csrf_exempt
def cleanup_api(request):
    """API endpoint for cleanup tasks that can be called periodically"""
    # Only allow POST requests with a secret key for security
    if request.method == 'POST':
        # You can add a secret key check here later if needed
        # if request.POST.get('secret_key') != 'your_secret_key_here':
        #     return HttpResponse('Unauthorized', status=401)
        
        # Run the cleanup
        clean_old_queue_entries()
        return HttpResponse('Cleanup completed successfully')
    
    return HttpResponse('Method not allowed', status=405)

