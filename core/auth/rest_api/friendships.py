from ninja import Router
from ninja.errors import HttpError
from django.db.models import Q
from django.db import transaction
from rest_api.models import Tuser, Friendship
from .jwt import UserJWTAuth
from .schemas import (
    FriendSchema,
    InvitationSchema
)
import logging

router = Router()
logger = logging.getLogger(__name__)

@router.get("/friends", auth=UserJWTAuth(), response=list[FriendSchema])
def list_friends(request):
    """List all friends of the authenticated user"""
    user = request.auth
    return user.friends.all().values(
        'id',
        'username',
        'fname',
        'lname',
        'image'
    )

@router.get("/friend-requests", auth=UserJWTAuth(), response=list[InvitationSchema])
def list_friend_requests(request):
    """List all pending friend requests"""
    user = request.auth
    return Friendship.objects.filter(
        Q(invitee=user) & Q(status=Friendship.Status.PENDING)
    ).select_related('inviter').values(
        'id',
        'inviter__username',
        'inviter__fname',
        'inviter__lname',
        'created_at'
    )

@router.post("/friend-request/{username}", auth=UserJWTAuth())
def send_friend_request(request, username: str):
    """Send a friend request to a user"""
    user = request.auth
    target = get_object_or_404(Tuser, username=username)
    if user == target:
        raise HttpError(400, "Cannot friend yourself")
    if user.friends.filter(id=target.id).exists():
        raise HttpError(400, "Already friends")
    if Friendship.objects.filter(
        Q(inviter=user) & Q(invitee=target)
    ).exists():
        raise HttpError(400, "Request already sent")
    with transaction.atomic():
        friendship = Friendship.objects.create(
            inviter=user,
            invitee=target,
            status=Friendship.Status.PENDING
        )
        user.sent_requests.add(friendship)
        target.received_requests.add(friendship)
    return {"success": "Friend request sent"}

@router.post("/accept-request/{request_id}", auth=UserJWTAuth())
def accept_friend_request(request, request_id: int):
    """Accept a friend request"""
    user = request.auth
    friendship = get_object_or_404(
        Friendship,
        id=request_id,
        invitee=user,
        status=Friendship.Status.PENDING
    )
    with transaction.atomic():
        friendship.status = Friendship.Status.ACCEPTED
        friendship.save()
        user.friends.add(friendship.inviter)
        friendship.inviter.friends.add(user)
    return {"success": "Friend request accepted"}

@router.post("/reject-request/{request_id}", auth=UserJWTAuth())
def reject_friend_request(request, request_id: int):
    """Reject a friend request"""
    user = request.auth
    friendship = get_object_or_404(
        Friendship,
        id=request_id,
        invitee=user,
        status=Friendship.Status.PENDING
    )
    friendship.delete()
    return {"success": "Friend request rejected"}

@router.post("/remove-friend/{username}", auth=UserJWTAuth())
def remove_friend(request, username: str):
    """Remove a friend from the list"""
    user = request.auth
    target = get_object_or_404(Tuser, username=username)
    if not user.friends.filter(id=target.id).exists():
        raise HttpError(400, "Not friends with this user")
    with transaction.atomic():
        user.friends.remove(target)
        target.friends.remove(user)
        Friendship.objects.filter(
            Q(inviter=user, invitee=target) |
            Q(inviter=target, invitee=user)
        ).delete()
    return {"success": "Friend removed"}
