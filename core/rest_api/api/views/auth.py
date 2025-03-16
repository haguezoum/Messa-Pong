from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from ..models import Tuser
from ..serializers import UserSerializer
from ..permissions import IsVerifiedUser
import os
import binascii

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.tmp_otp = int.from_bytes(os.urandom(2))
            user.save()
            
            if not user.email.endswith('@lmongol.lol'):
                self._send_otp(user.tmp_otp, user.email)
            else:
                user.verified = True
                user.save()

            refresh = RefreshToken.for_user(user)
            response = Response({
                'token': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)
            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                path='/'
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = Tuser.objects.filter(username=username).first() or \
               Tuser.objects.filter(email=username).first()

        if not user or not check_password(password, user.password_hash):
            return Response({
                'error': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response_data = {
            'token': str(refresh.access_token),
            'locked': user.tfa_enabled
        }

        if user.tfa_enabled:
            user.tfa_otp = int.from_bytes(os.urandom(2))
            user.save()
            self._send_otp(user.tfa_otp, user.email)

        response = Response(response_data)
        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            path='/'
        )
        return response

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                user = request.user
                if user.tfa_enabled:
                    user.tfa_locked = True
                    user.tfa_otp = 0
                    user.save()

            response = Response({'success': 'User logged out'})
            response.delete_cookie('refresh_token', path='/')
            return response
        except Exception:
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify_otp(self, request):
        user = request.user
        otp = request.data.get('otp')

        if user.verified:
            return Response({'success': 'Account already verified'})

        if int(otp) == user.tmp_otp:
            user.verified = True
            user.save()
            return Response({'success': 'Account verified'})
        
        return Response({
            'error': 'Invalid OTP'
        }, status=status.HTTP_400_BAD_REQUEST)

    def _send_otp(self, otp, email):
        send_mail(
            'OTP Verification',
            f"Here's your verification OTP: {otp}",
            os.getenv('EMAIL_HOST_USER'),
            [email],
            fail_silently=False,
        ) 