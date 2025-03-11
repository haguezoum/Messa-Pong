from ninja import Router
from ninja.errors import HttpError
from django.db.models import Q, Prefetch
from django.utils import timezone
from rest_api.models import Tuser, Conversation, Message
from .jwt import UserJWTAuth
from .schemas import (
    ConversationSchema,
    MessageSchema,
    BlockSchema
)
import logging

router = Router()
logger = logging.getLogger(__name__)

@router.post("/conversations", auth=UserJWTAuth(), response=ConversationSchema)
def create_conversation(request, user_id: int):
    """Create a new conversation between authenticated user and target user"""
    user = request.auth
    target_user = get_object_or_404(Tuser, id=user_id)
    if not user.friends.filter(id=target_user.id).exists():
        raise HttpError(403, "Users must be friends to message")
    if user.blocked_users.filter(id=target_user.id).exists():
        raise HttpError(403, "User is blocked")
    conversation = Conversation.objects.filter(
        participants=user
    ).filter(
        participants=target_user
    ).first()
    if conversation:
        return conversation
    new_conversation = Conversation.objects.create()
    new_conversation.participants.add(user, target_user)
    return new_conversation

@router.get("/conversations", auth=UserJWTAuth(), response=list[ConversationSchema])
def list_conversations(request):
    """List all user conversations with last message preview"""
    user = request.auth
    conversations = Conversation.objects.filter(
        participants=user
    ).prefetch_related(
        Prefetch('messages', queryset=Message.objects.order_by('-timestamp')[:1])
    ).annotate(
        last_message=models.F('messages__message'),
        last_sender=models.F('messages__sender'),
        last_timestamp=models.F('messages__timestamp')
    )
    return [{
        'id': conv.id,
        'participants': [p.id for p in conv.participants.all()],
        'last_message': {
            'sender': conv.last_sender,
            'message': conv.last_message,
            'timestamp': conv.last_timestamp
        } if conv.last_message else None
    } for conv in conversations]

@router.get("/conversations/{conv_id}/messages", auth=UserJWTAuth(), response=list[MessageSchema])
def get_messages(request, conv_id: int):
    """Retrieve messages for a conversation"""
    user = request.auth
    conversation = get_object_or_404(Conversation, id=conv_id)
    if not conversation.participants.filter(id=user.id).exists():
        raise HttpError(403, "Not part of this conversation")
    messages = Message.objects.filter(
        conversation=conversation
    ).select_related('sender').order_by('timestamp')
    return [{
        'sender': msg.sender.username,
        'content': msg.content,
        'timestamp': msg.timestamp
    } for msg in messages]

@router.post("/conversations/{conv_id}/messages", auth=UserJWTAuth(), response=MessageSchema)
def send_message(request, conv_id: int, content: str):
    """Send a new message"""
    user = request.auth
    conversation = get_object_or_404(Conversation, id=conv_id)
    if not conversation.participants.filter(id=user.id).exists():
        raise HttpError(403, "Not part of this conversation")
    message = Message.objects.create(
        conversation=conversation,
        sender=user,
        content=content,
        timestamp=timezone.now()
    )
    return {
        'sender': user.username,
        'content': content,
        'timestamp': message.timestamp
    }

@router.post("/block", auth=UserJWTAuth(), response=BlockSchema)
def block_user(request, user_id: int):
    """Block a user and remove all conversations"""
    user = request.auth
    target_user = get_object_or_404(Tuser, id=user_id)
    Conversation.objects.filter(
        participants=user
    ).filter(
        participants=target_user
    ).delete()
    user.blocked_users.add(target_user)
    return {
        'blocked_user': target_user.id,
        'status': 'blocked'
    }
