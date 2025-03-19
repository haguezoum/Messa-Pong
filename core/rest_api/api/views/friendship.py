from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Tuser, Friendship
from ..permissions import IsVerifiedUser

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVerifiedUser])
def get_friends(request):
    """Get user's friends list"""
    user = request.user
    friends = user.friends.all()
    
    friend_list = [{
        'friend_id': friend.username,
        'status': 'online' if friend.uonline == Tuser.OnlineStatus.ONLINE else 'offline'
    } for friend in friends]
    
    return Response({'success': friend_list})

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsVerifiedUser])
def get_friend_requests(request):
    """Get pending friend requests"""
    user = request.user
    pending_requests = Friendship.objects.filter(
        invitee=user,
        status=Friendship.Status.PENDING
    )
    
    requests = [{
        'inviter': request.inviter.username,
        'inviter_id': request.inviter.id,
        'status': 'Pending'
    } for request in pending_requests]
    
    return Response({'success': requests})

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVerifiedUser])
def send_friend_request(request):
    """Send a friend request"""
    user = request.user
    friend_username = request.data.get('username')
    
    if user.username == friend_username:
        return Response({
            'error': 'Cannot send friend request to yourself'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    friend = Tuser.objects.filter(username=friend_username).first()
    if not friend:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if user.friends.filter(id=friend.id).exists():
        return Response({
            'success': 'Already friends'
        })
    
    if Friendship.objects.filter(
        inviter=user,
        invitee=friend,
        status=Friendship.Status.PENDING
    ).exists():
        return Response({
            'success': 'Friend request already sent'
        })
    
    Friendship.objects.create(
        inviter=user,
        invitee=friend,
        status=Friendship.Status.PENDING
    )
    
    return Response({
        'success': 'Friend request sent'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsVerifiedUser])
def handle_friend_request(request):
    """Accept or reject friend request"""
    user = request.user
    inviter_username = request.data.get('username')
    action = request.data.get('action')
    
    friendship = Friendship.objects.filter(
        inviter__username=inviter_username,
        invitee=user,
        status=Friendship.Status.PENDING
    ).first()
    
    if not friendship:
        return Response({
            'error': 'Friend request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if action == 'accept':
        user.friends.add(friendship.inviter)
        friendship.inviter.friends.add(user)
        friendship.delete()
        return Response({
            'success': 'Friend request accepted'
        })
    elif action == 'reject':
        friendship.delete()
        return Response({
            'success': 'Friend request rejected'
        })
    
    return Response({
        'error': 'Invalid action'
    }, status=status.HTTP_400_BAD_REQUEST) 