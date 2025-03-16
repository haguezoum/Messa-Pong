from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import check_password, make_password
from ..models import Tuser
from ..serializers import UserSerializer
from ..permissions import IsVerifiedUser
import os
import binascii
from zxcvbn import zxcvbn
import re

class UserViewSet(viewsets.ModelViewSet):
    queryset = Tuser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsVerifiedUser]

    @action(detail=False, methods=['get'])
    def self(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_profile(self, request):
        user = request.user
        data = request.data

        if 'old_password' in data and 'new_password' in data:
            if not check_password(data['old_password'], user.password_hash):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if zxcvbn(data['new_password'])['score'] < 3:
                return Response({
                    'error': 'Password is too weak'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.password_hash = make_password(data['new_password'])

        if 'email' in data:
            if not re.match(r'^\S+@\S+\.\S+$', data['email']):
                return Response({
                    'error': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if Tuser.objects.filter(email=data['email']).exclude(id=user.id).exists():
                return Response({
                    'error': 'Email already in use'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.email = data['email']
            user.verified = False
            user.tmp_otp = int.from_bytes(os.urandom(2))
            self._send_verification_email(user)

        for field in ['username', 'fname', 'lname', 'bio']:
            if field in data:
                setattr(user, field, data[field])

        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'])
    def forgot_password(self, request):
        email = request.data.get('email')
        user = Tuser.objects.filter(email=email).first()
        
        if user:
            user.fp_token = binascii.hexlify(os.urandom(32)).decode()
            user.save()
            self._send_reset_email(user)
        
        return Response({'success': 'If email exists, reset instructions have been sent'})

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        user = Tuser.objects.filter(fp_token=token).first()
        if not user:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)

        if zxcvbn(new_password)['score'] < 3:
            return Response({
                'error': 'Password is too weak'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.password_hash = make_password(new_password)
        user.fp_token = ''
        user.save()
        
        return Response({'success': 'Password updated successfully'})

    @action(detail=False, methods=['post'])
    def enable_2fa(self, request):
        user = request.user
        user.tfa_enabled = not user.tfa_enabled
        user.tfa_locked = False if user.tfa_enabled else True
        user.save()
        
        status_text = 'enabled' if user.tfa_enabled else 'disabled'
        return Response({'success': f'Two factor authentication is {status_text}'})

    def _send_verification_email(self, user):
        pass

    def _send_reset_email(self, user):
        pass 
