from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from ..models import Tuser
from ..serializers import UserSerializer, UserCreateSerializer
from ..permissions import IsVerifiedUser
import os
import binascii
import logging
import requests
from django.shortcuts import redirect
from django.conf import settings

logger = logging.getLogger(__name__)

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        try:
            logger.info(f"Received registration data: {request.data}")
            
            serializer = UserCreateSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                response_data = {
                    'status': 'success',
                    'token': str(refresh.access_token),
                    'user': UserSerializer(user).data
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Validation errors: {serializer.errors}")
            return Response({
                'status': 'error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.exception("Registration error")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = Tuser.objects.filter(username=username).first() or \
               Tuser.objects.filter(email=email).first()

        if not user or not check_password(password, user.password):
            return Response({
                'error': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        response_data = {
            'token': str(refresh.access_token),
            'locked': user.tfa_enabled
        }

        if user.tfa_enabled:
            user.tfa_otp = int.from_bytes(os.urandom(2), byteorder='big')
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

@api_view(['GET'])
def auth_42(request):
    return redirect(f"{settings.API_42_AUTHORIZE_URL}?client_id={settings.API_42_CLIENT_ID}&redirect_uri={settings.API_42_REDIRECT_URI}&response_type=code")

@api_view(['GET'])
def auth_42_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'No code provided'}, status=400)

    token_response = requests.post(settings.API_42_TOKEN_URL, data={
        'grant_type': 'authorization_code',
        'client_id': settings.API_42_CLIENT_ID,
        'client_secret': settings.API_42_CLIENT_SECRET,
        'code': code,
        'redirect_uri': settings.API_42_REDIRECT_URI,
    })

    if token_response.status_code != 200:
        return Response({'error': 'Failed to obtain access token'}, status=400)

    access_token = token_response.json().get('access_token')
    user_info_response = requests.get(settings.API_42_USER_INFO_URL, headers={
        'Authorization': f'Bearer {access_token}'
    })

    if user_info_response.status_code != 200:
        return Response({'error': 'Failed to fetch user info'}, status=400)

    user_info = user_info_response.json()

    # Handle user info (e.g., create or update user in your database)
    # ...

    return Response({'success': 'Authenticated with 42', 'user_info': user_info}) 
