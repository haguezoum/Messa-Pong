from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Conversation, Message, Tuser
from ..serializers import ConversationSerializer, MessageSerializer
from ..permissions import IsVerifiedUser

class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsVerifiedUser]
    
    @action(detail=False, methods=['post'])
    def create_conversation(self, request):
        """Create a new conversation with another user"""
        user = request.user
        other_username = request.data.get('user')
        
        other_user = Tuser.objects.filter(username=other_username).first()
        if not other_user:
            return Response({
                'error': "User doesn't exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if not user.friends.filter(id=other_user.id).exists():
            return Response({
                'error': "Users are not friends"
            }, status=status.HTTP_400_BAD_REQUEST)

        existing_conv = Conversation.objects.filter(
            participants=user
        ).filter(
            participants=other_user
        ).first()

        if existing_conv:
            return Response({
                'success': "Conversation already created",
                'conv_id': existing_conv.id
            })

        conversation = Conversation.objects.create()
        conversation.participants.add(user, other_user)
        conversation.save()

        return Response({
            'success': "Conversation created",
            'conv_id': conversation.id
        })

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Get all conversations for the current user"""
        user = request.user
        conversations = Conversation.objects.filter(participants=user)
        
        conv_list = []
        for conv in conversations:
            other_user = conv.participants.exclude(id=user.id).first()
            last_message = conv.messages.last()
            conv_data = {
                'user': other_user.id,
                'fullname': f"{other_user.fname} {other_user.lname}",
                'profileImage': other_user.image,
                'username': other_user.username,
                'conv_id': conv.id,
                'last_message': last_message.content if last_message else "",
                'date': last_message.created_at if last_message else ""
            }
            conv_list.append(conv_data)

        return Response({'success': conv_list})

    @action(detail=False, methods=['get'])
    def messages(self, request):
        """Get all messages for a specific conversation"""
        conv_id = request.query_params.get('conv_id')
        user = request.user

        conversation = Conversation.objects.filter(id=conv_id).first()
        if not conversation:
            return Response({
                'error': "Conversation doesn't exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if not conversation.participants.filter(id=user.id).exists():
            return Response({
                'error': "Not authorized to view this conversation"
            }, status=status.HTTP_403_FORBIDDEN)

        messages = []
        for message in conversation.messages.all():
            messages.append({
                'sender_id': message.sender.id,
                'message': message.content,
                'date': message.created_at
            })

        return Response({'success': messages})

    @action(detail=False, methods=['post'])
    def register_message(self, request):
        """Register a new message in a conversation"""
        conv_id = request.data.get('conv_id')
        message_content = request.data.get('message')
        user = request.user

        conversation = Conversation.objects.filter(id=conv_id).first()
        if not conversation:
            return Response({
                'error': "Conversation doesn't exist"
            }, status=status.HTTP_404_NOT_FOUND)

        if not conversation.participants.filter(id=user.id).exists():
            return Response({
                'error': "Not authorized to post in this conversation"
            }, status=status.HTTP_403_FORBIDDEN)

        message = Message.objects.create(
            sender=user,
            content=message_content
        )
        conversation.messages.add(message)
        conversation.save()

        return Response({'success': "Message added"})

    @action(detail=False, methods=['post'])
    def block_user(self, request):
        """Block a user from chatting"""
        user_id = request.data.get('user_id')
        user = request.user
        
        blocked_user = Tuser.objects.filter(id=user_id).first()
        if not blocked_user:
            return Response({
                'error': "Can't find the user"
            }, status=status.HTTP_404_NOT_FOUND)

        if user.blocked.filter(id=blocked_user.id).exists():
            return Response({'success': "User already blocked"})

        user.blocked.add(blocked_user)
        blocked_user.blocked.add(user)
        
        return Response({'success': "User is blocked"}) 
