from django.contrib.auth import authenticate, login
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp import devices_for_user
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser
from rest_framework.renderers import JSONRenderer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.shortcuts import redirect
from django.http import HttpResponse
from django.core import serializers
from io import BytesIO
import logging
import qrcode
from base64 import b64encode
import requests
from PIL import Image
from django.core.files import File
from .models import User, FriendRequest, Friendship, Game, Message, UserBlock
from .serializers import UserSerializer, PublicUserSerializer, FriendRequestSerializer, FriendshipSerializer, GameSerializer, MessageSerializer, UserBlockSerializer
from urllib.parse import urlencode
from rest_framework.filters import SearchFilter
import time
from django.core.files.storage import default_storage
from django.urls import reverse
import threading
from django.db.models import Q
from urllib.parse import urlparse, parse_qs
import pyotp

logger = logging.getLogger(__name__)

class OTPVerifyThrottle(UserRateThrottle):
    rate = '10/hour'


class OAuth42LoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth_url = (
            f"{settings.OAUTH_42_AUTH_URL}?client_id={settings.OAUTH_42_CLIENT_ID}"
            f"&redirect_uri={settings.OAUTH_42_REDIRECT_URI}"
            "&response_type=code&scope=public"
        )
        logger.info(f"Redirecting to 42 auth URL: {auth_url}")
        return redirect(auth_url)


class OAuth42CallbackView(APIView):
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        logger.info("Entering OAuth42CallbackView")
        code = request.GET.get('code')
        if not code:
            logger.error("No code provided in 42 OAuth callback")
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

        token_payload = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_42_CLIENT_ID,
            'client_secret': settings.OAUTH_42_CLIENT_SECRET,
            'redirect_uri': settings.OAUTH_42_REDIRECT_URI,
            'code': code,
        }
        token_response = requests.post(settings.OAUTH_42_TOKEN_URL, data=token_payload)
        if token_response.status_code != 200:
            logger.error(f"Failed to get token from 42: {token_response.text}")
            return Response({'error': 'Failed to authenticate with 42'}, status=status.HTTP_400_BAD_REQUEST)

        token_data = token_response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            logger.error("No access token received from 42")
            return Response({'error': 'No access token received'}, status=status.HTTP_400_BAD_REQUEST)

        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(settings.OAUTH_42_USERINFO_URL, headers=headers)
        if user_response.status_code != 200:
            logger.error(f"Failed to get user info from 42: {user_response.text}")
            return Response({'error': 'Failed to get user info'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = user_response.json()
        logger.info(f"42 user data received: {user_data}")

        oauth_id = str(user_data['id'])
        email = user_data.get('email')
        username = user_data.get('login')
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')
        profile_picture_url = user_data.get('image', {}).get('versions', {}).get('medium')

        try:
            user = User.objects.get(oauth_42_id=oauth_id)
            logger.info(f"Existing 42 user found: {user.username}")
            if not user.profile_picture or user.profile_picture.name == 'profile_pics/default.png':
                if profile_picture_url:
                    self.update_profile_picture(user, profile_picture_url)
        except User.DoesNotExist:
            if User.objects.filter(email=email).exists():
                logger.error(f"Email {email} already registered with another account")
                return Response({'error': 'Email already registered with another account'},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,
                first_name=first_name,
                last_name=last_name,
                oauth_42_id=oauth_id
            )
            if profile_picture_url:
                self.update_profile_picture(user, profile_picture_url)
            logger.info(f"New 42 user created: {user.username}")

        user.backend = 'core.backends.EmailBackend'
        login(request, user)
        logger.info(f"User {user.username} logged in, is_authenticated: {request.user.is_authenticated}")

        refresh = RefreshToken.for_user(user)
        redirect_url = 'https://localhost/oauth-callback'
        params = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'provider': '42',
        }
        return redirect(f"{redirect_url}?{urlencode(params)}")

    def update_profile_picture(self, user, picture_url):
        try:
            response = requests.get(picture_url, stream=True)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                img.verify()
                img = Image.open(BytesIO(response.content))
                buffer = BytesIO()
                img.save(buffer, format='JPEG')
                buffer.seek(0)
                filename = f"{user.username}_42_profile.jpg"
                user.profile_picture.save(filename, File(buffer), save=True)
                logger.info(f"Profile picture updated for {user.username}")
            else:
                logger.warning(f"Failed to download profile picture: {response.status_code}")
        except Exception as e:
            logger.error(f"Error updating profile picture for {user.username}: {str(e)}")


class OAuthGoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth_url = (
            f"{settings.OAUTH_GOOGLE_AUTH_URL}?client_id={settings.OAUTH_GOOGLE_CLIENT_ID}"
            f"&redirect_uri={settings.OAUTH_GOOGLE_REDIRECT_URI}"
            "&response_type=code&scope=openid%20email%20profile"
        )
        logger.info(f"Redirecting to Google auth URL: {auth_url}")
        return redirect(auth_url)


class OAuthGoogleCallbackView(APIView):
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]

    def get(self, request):
        logger.info("Entering OAuthGoogleCallbackView")
        code = request.GET.get('code')
        if not code:
            logger.error("No code provided in Google OAuth callback")
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

        token_payload = {
            'code': code,
            'client_id': settings.OAUTH_GOOGLE_CLIENT_ID,
            'client_secret': settings.OAUTH_GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.OAUTH_GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        token_response = requests.post(settings.OAUTH_GOOGLE_TOKEN_URL, data=token_payload)
        if token_response.status_code != 200:
            logger.error(f"Failed to get token from Google: {token_response.text}")
            return Response({'error': 'Failed to authenticate with Google'}, status=status.HTTP_400_BAD_REQUEST)

        token_data = token_response.json()
        access_token = token_data.get('access_token')
        if not access_token:
            logger.error("No access token received from Google")
            return Response({'error': 'No access token received'}, status=status.HTTP_400_BAD_REQUEST)

        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(settings.OAUTH_GOOGLE_USERINFO_URL, headers=headers)
        if user_response.status_code != 200:
            logger.error(f"Failed to get user info from Google: {user_response.text}")
            return Response({'error': 'Failed to get user info'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = user_response.json()
        logger.info(f"Google user data received: {user_data}")

        oauth_id = user_data['sub']
        email = user_data.get('email')
        username = email.split('@')[0]
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')
        profile_picture_url = user_data.get('picture')

        try:
            user = User.objects.get(oauth_google_id=oauth_id)
            logger.info(f"Existing Google user found: {user.username}")
            if not user.profile_picture or user.profile_picture.name == 'profile_pics/default.png':
                if profile_picture_url:
                    self.update_profile_picture(user, profile_picture_url)
        except User.DoesNotExist:
            if User.objects.filter(email=email).exists():
                logger.error(f"Email {email} already registered with another account")
                return Response({'error': 'Email already registered with another account'},
                                status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,
                first_name=first_name,
                last_name=last_name,
                oauth_google_id=oauth_id
            )
            if profile_picture_url:
                self.update_profile_picture(user, profile_picture_url)
            logger.info(f"New Google user created: {user.username}")

        user.backend = 'core.backends.EmailBackend'
        login(request, user)
        logger.info(f"User {user.username} logged in, is_authenticated: {request.user.is_authenticated}")

        refresh = RefreshToken.for_user(user)
        redirect_url = 'https://localhost/oauth-callback'
        params = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'provider': 'google',
        }
        return redirect(f"{redirect_url}?{urlencode(params)}")

    def update_profile_picture(self, user, picture_url):
        try:
            response = requests.get(picture_url, stream=True)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                img.verify()
                img = Image.open(BytesIO(response.content))
                buffer = BytesIO()
                img.save(buffer, format='JPEG')
                buffer.seek(0)
                filename = f"{user.username}_google_profile.jpg"
                user.profile_picture.save(filename, File(buffer), save=True)
                logger.info(f"Profile picture updated for {user.username}")
            else:
                logger.warning(f"Failed to download profile picture: {response.status_code}")
        except Exception as e:
            logger.error(f"Error updating profile picture for {user.username}: {str(e)}")


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        logger.info(f"Profile fetched for user: {request.user.username}")
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Profile updated for user: {request.user.username}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Profile update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfilePictureUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.profile_picture.delete(save=False)
        request.user.profile_picture = request.FILES['profile_picture']
        request.user.save()

        serializer = UserSerializer(user, context={'request': request})
        logger.info(f"Profile picture updated for user: {request.user.username}")
        return Response(serializer.data, status=status.HTTP_200_OK)


def send_email_in_thread(subject, message, from_email, recipient_list, html_message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"2FA email sent to {recipient_list[0]}")
    except Exception as e:
        logger.error(f"Failed to send 2FA email to {recipient_list[0]}: {str(e)}", exc_info=True)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [SearchFilter]
    search_fields = ['username', 'first_name', 'last_name']

    def get_permissions(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'profile_picture', 'enable_2fa', 'verify_2fa']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_object(self):
        if self.action in ['update', 'partial_update', 'profile_picture', 'enable_2fa', 'verify_2fa']:
            return self.request.user
        
        if self.action == 'retrieve':
            lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
            lookup_value = self.kwargs.get(lookup_url_kwarg)
            
            if lookup_value == 'me' or str(lookup_value) == str(self.request.user.id):
                return self.request.user
        
        return super().get_object()

    @action(detail=False, methods=['post'], url_path='profile-picture')
    def profile_picture(self, request):
        user = request.user
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
            user.save()
            logger.info(f"Profile picture updated for user: {user.username}")
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        logger.error(f"No file provided for profile picture upload by {user.username}")
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='2fa/enable')
    def enable_2fa(self, request):
        user = request.user
        logger.info(f"Starting 2FA enable process for user: {user.username}")
        if user.is_2fa_enabled:
            return Response({'error': '2FA already enabled'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            device_name = f"{user.username}_authenticator_{int(time.time())}"
            device, created = TOTPDevice.objects.get_or_create(user=user, name=device_name)
            
            parsed = urlparse(device.config_url)
            secret = parse_qs(parsed.query)['secret'][0]
            
            current_code = pyotp.TOTP(secret).now()

            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(device.config_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_code = b64encode(buffer.getvalue()).decode('utf-8')
            qr_code_data_uri = f'data:image/png;base64,{qr_code}'

            html_content = f"""
            <html>
                <body>
                    <p>Dear {user.username},</p>
                    <p>Two-Factor Authentication (2FA) has been initiated for your account. 
                    Please complete setup using one of these methods:</p>
                    
                    <h3>Method 1: QR Code</h3>
                    <img src="{qr_code_data_uri}" alt="2FA QR Code" style="margin: 10px 0;">
                    
                    <h3>Method 2: Manual Setup</h3>
                    <p>Secret Key: <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px">{secret}</code></p>
                    <p>Current Verification Code: 
                    <strong style="font-size: 18px; letter-spacing: 2px">{current_code}</strong></p>
                    
                    <p><em>Note: The verification code refreshes every 30 seconds. 
                    Use apps like Google Authenticator or Authy.</em></p>
                    
                    <p>Best regards,<br/>
                    Security Team</p>
                </body>
            </html>
            """

            thread = threading.Thread(
                target=send_email_in_thread,
                args=(
                    'Secure Your Account: Two-Factor Authentication Setup',
                    f'Your 2FA secret: {secret}\nCurrent code: {current_code}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    html_content,
                ),
            )
            thread.start()

            return Response({
                'qr_code': qr_code_data_uri,
                'secret_key': secret,
                'current_code': current_code
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"2FA setup failed: {str(e)}")
            return Response({'error': '2FA configuration error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
    @action(detail=False, methods=['get'], url_path='2fa/qr', permission_classes=[AllowAny])
    def get_2fa_qr(self, request):
        temporary_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not temporary_token:
            return Response({'error': 'Temporary token required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = AccessToken(temporary_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
        except Exception as e:
            logger.error(f"Invalid temporary token: {str(e)}")
            return Response({'error': 'Invalid or expired temporary token'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_2fa_enabled:
            return Response({'error': '2FA not enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = TOTPDevice.objects.filter(user=user).first()
            if not device:
                return Response({'error': 'No 2FA device found'}, status=status.HTTP_400_BAD_REQUEST)

            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(device.config_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")

            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_code = b64encode(buffer.getvalue()).decode('utf-8')
            qr_code_data_uri = f'data:image/png;base64,{qr_code}'

            logger.info(f"QR code fetched for user: {user.username}")
            return Response({'qr_code': qr_code_data_uri}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating QR code for {user.username}: {str(e)}")
            return Response({'error': 'Failed to generate QR code'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='2fa/verify', permission_classes=[AllowAny])
    def verify_2fa(self, request):
        token = request.headers.get('Authorization', '').replace('Bearer ', '') or request.data.get('temporary_token')
        code = request.data.get('code')
        if not token or not code:
            return Response({'error': 'Token and code required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token_obj = AccessToken(token)
            user_id = token_obj['user_id']
            user = User.objects.get(id=user_id)
        except Exception:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        for device in devices_for_user(user):
            if device.verify_token(code):
                if not request.data.get('temporary_token') and not user.is_2fa_enabled:
                    user.is_2fa_enabled = True
                    user.save()
                    logger.info(f"2FA enabled for user: {user.username}")
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'is_2fa_enabled': user.is_2fa_enabled
                }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)


class PublicUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None, username=None):
        logger.info(f"PUBLIC USER VIEW REQUEST: {request.path}, id={id}, username={username}, auth_user={request.user.username}")
        logger.info(f"URL Kwargs: {request.resolver_match.kwargs if hasattr(request, 'resolver_match') else 'No resolver match'}")
        try:
            if id is not None:
                logger.info(f"Fetching by id={id}")
                user = User.objects.get(id=id)
            elif username is not None:
                logger.info(f"Fetching by username={username}")
                # First try exact match, then case-insensitive lookup
                try:
                    # Try exact match first
                    user = User.objects.get(username=username)
                    logger.info(f"Found user with exact username match: {username}")
                except User.DoesNotExist:
                    # Fall back to case-insensitive match
                    logger.info(f"Exact match not found, trying case-insensitive lookup for: {username}")
                    user = User.objects.filter(username__iexact=username).first()
                    if not user:
                        # Try username as partial match if still not found
                        logger.info(f"Case-insensitive lookup failed, trying partial match for: {username}")
                        user = User.objects.filter(username__icontains=username).first()
                        if not user:
                            logger.warning(f"User not found with any method: username={username}")
                            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                        logger.info(f"Found user with partial username match: {user.username}")
                    else:
                        logger.info(f"Found user with case-insensitive match: {user.username}")
            else:
                logger.warning("No id or username provided")
                return Response({'error': 'ID or username required'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = PublicUserSerializer(user)
            logger.info(f"Returning user: {user.username}, data={serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            logger.warning(f"User not found: id={id}, username={username}")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user)
        )

    @action(detail=False, methods=['GET'], url_path='status/(?P<user_id>[^/.]+)')
    def check_status(self, request, user_id=None):
        try:
            if user_id.isdigit():
                target_user = User.objects.get(id=user_id)
            else:
                target_user = User.objects.get(username=user_id)
                
            is_blocked = UserBlock.objects.filter(
                (Q(user=request.user) & Q(blocked_user=target_user)) |
                (Q(user=target_user) & Q(blocked_user=request.user))
            ).exists()
            
            if is_blocked:
                return Response({
                    'status': 'blocked',
                    'message': 'User is blocked'
                })

            friendship = Friendship.objects.filter(
                (Q(user=request.user) & Q(friend=target_user)) |
                (Q(user=target_user) & Q(friend=request.user))
            ).first()
            
            if friendship:
                return Response({
                    'status': 'accepted',
                    'message': 'Already friends'
                })
                
            sent_request = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=target_user,
                status='pending'
            ).first()
            
            if sent_request:
                return Response({
                    'status': 'pending',
                    'request_id': sent_request.id,
                    'message': 'Friend request sent'
                })
                
            received_request = FriendRequest.objects.filter(
                from_user=target_user,
                to_user=request.user,
                status='pending'
            ).first()
            
            if received_request:
                return Response({
                    'status': 'received',
                    'request_id': received_request.id,
                    'message': 'Friend request received'
                })
                
            return Response({
                'status': 'none',
                'message': 'No friendship or requests'
            })
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        to_user_id = serializer.validated_data.get('to_user_id')
        
        # Check if a request already exists
        existing_request = FriendRequest.objects.filter(
            from_user=self.request.user,
            to_user_id=to_user_id
        ).first()
        
        if existing_request:
            # If request exists, don't create a new one
            # We can't return a Response from perform_create, so we'll just not save a new one
            return
        
        # Also ensure no duplicate exists before saving
        FriendRequest.objects.filter(
            from_user=self.request.user,
            to_user_id=to_user_id
        ).delete()
        
        serializer.save(from_user=self.request.user)
        
    @action(detail=False, methods=['DELETE'], url_path='cancel/(?P<user_id>[^/.]+)')
    def cancel_request(self, request, user_id=None):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            # Find the request from current user to target user and delete it
            # Use delete() instead of first().delete() to ensure we clean up any duplicates
            deleted_count = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=user
            ).delete()[0]
            
            if deleted_count > 0:
                return Response({"detail": "Friend request cancelled"}, status=status.HTTP_200_OK)
            else:
                # Even if no requests were found, return 200 OK to avoid error on the frontend
                return Response({"detail": "No friend request found"}, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response(
                {"detail": f"Error cancelling request: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['PATCH'], url_path='accept')
    def accept(self, request, pk=None):
        try:
            friend_request = self.get_object()
            
            if friend_request.to_user != request.user:
                return Response({'error': 'You can only accept requests sent to you'}, 
                                status=status.HTTP_403_FORBIDDEN)
            
            friend_request.status = 'accepted'
            friend_request.save()
            
            Friendship.objects.create(user=friend_request.from_user, friend=friend_request.to_user)
            Friendship.objects.create(user=friend_request.to_user, friend=friend_request.from_user)
            
            return Response({'message': 'Friend request accepted'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['PATCH'], url_path='reject')
    def reject(self, request, pk=None):
        friend_request = self.get_object()
        friend_request.status = 'rejected'
        friend_request.save()
        return Response({'message': 'Friend request rejected'}, status=status.HTTP_200_OK)


class FriendshipViewSet(viewsets.ModelViewSet):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            try:
                target_user = User.objects.get(id=user_id)
                return Friendship.objects.filter(user=target_user)
            except User.DoesNotExist:
                return Friendship.objects.none()
        return Friendship.objects.filter(user=self.request.user)
        
    @action(detail=False, methods=['GET'], url_path='by-user/(?P<user_id>[^/.]+)')
    def get_user_friends(self, request, user_id=None):
        """Get friends list for a specific user by their ID"""
        try:
            target_user = User.objects.get(id=user_id)
            friendships = Friendship.objects.filter(user=target_user)
            serializer = self.get_serializer(friendships, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['DELETE'], url_path='remove/(?P<friend_id>[^/.]+)')
    def remove_friend(self, request, friend_id=None):
        """Remove a friend by deleting both friendship records"""
        try:
            # Find the friend user
            friend = User.objects.get(id=friend_id)
            
            # Check both directions of the friendship
            friendship1 = Friendship.objects.filter(user=request.user, friend=friend)
            friendship2 = Friendship.objects.filter(user=friend, friend=request.user)
            
            if not friendship1.exists() and not friendship2.exists():
                return Response({"error": "Friendship does not exist"}, status=status.HTTP_404_NOT_FOUND)
            
            # Delete both friendship records
            if friendship1.exists():
                friendship1.delete()
            if friendship2.exists():
                friendship2.delete()
                
            return Response({"message": "Friend removed successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserBlockViewSet(viewsets.ModelViewSet):
    serializer_class = UserBlockSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBlock.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Check if we're trying to block ourselves
        blocked_user_id = serializer.validated_data.get('blocked_user_id')
        if blocked_user_id == self.request.user.id:
            raise serializers.ValidationError("You cannot block yourself")
            
        # Delete any existing friendship when blocking
        try:
            blocked_user = User.objects.get(id=blocked_user_id)
            
            # Remove any existing friendship
            Friendship.objects.filter(
                (Q(user=self.request.user) & Q(friend=blocked_user)) |
                (Q(user=blocked_user) & Q(friend=self.request.user))
            ).delete()
            
            # Delete any pending friend requests
            FriendRequest.objects.filter(
                (Q(from_user=self.request.user) & Q(to_user=blocked_user)) |
                (Q(from_user=blocked_user) & Q(to_user=self.request.user))
            ).delete()
            
            serializer.save(user=self.request.user)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
    
    @action(detail=False, methods=['DELETE'], url_path='unblock/(?P<user_id>[^/.]+)')
    def unblock_user(self, request, user_id=None):
        """Unblock a previously blocked user"""
        try:
            blocked_user = User.objects.get(id=user_id)
            block = UserBlock.objects.filter(user=request.user, blocked_user=blocked_user).first()
            
            if not block:
                return Response({"error": "User is not blocked"}, status=status.HTTP_404_NOT_FOUND)
                
            block.delete()
            return Response({"message": "User unblocked successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        search_query = request.query_params.get('search', '')
        if not search_query:
            return Response([], status=status.HTTP_200_OK)
        
        logger.info(f"Searching for users with query: {search_query}")
        
        # Find users by case-insensitive username match
        users = User.objects.filter(username__icontains=search_query)[:10]
        
        # Serialize and return the results
        serializer = PublicUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FriendshipStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        logger.info(f"FriendshipStatusView: checking status for user_id={user_id}")
        try:
            # Check if user_id is numeric or a username
            if user_id.isdigit():
                logger.info(f"Looking up target user by ID: {user_id}")
                target_user = User.objects.get(id=user_id)
            else:
                logger.info(f"Looking up target user by username: {user_id}")
                # First try exact match, then case-insensitive
                try:
                    target_user = User.objects.get(username=user_id)
                except User.DoesNotExist:
                    target_user = User.objects.filter(username__iexact=user_id).first()
                    if not target_user:
                        logger.warning(f"User not found with username: {user_id}")
                        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            logger.info(f"Found target user: {target_user.username} (ID: {target_user.id})")
            
            # Check for existing friendship
            friendship = Friendship.objects.filter(
                (Q(user=request.user, friend=target_user) | Q(user=target_user, friend=request.user))
            ).first()
            if friendship:
                logger.info(f"Friendship exists between {request.user.username} and {target_user.username}")
                return Response({"status": "accepted"})
            
            # Check for pending requests
            request_sent = FriendRequest.objects.filter(
                from_user=request.user, to_user=target_user, status='pending'
            ).first()
            request_received = FriendRequest.objects.filter(
                from_user=target_user, to_user=request.user, status='pending'
            ).first()
            
            if request_sent:
                logger.info(f"{request.user.username} has sent a pending request to {target_user.username}")
                return Response({"status": "pending"})
            if request_received:
                logger.info(f"{request.user.username} has received a pending request from {target_user.username}")
                return Response({"status": "received", "request_id": request_received.id})
            
            logger.info(f"No friendship relationship exists between {request.user.username} and {target_user.username}")
            return Response({"status": "none"})
        except User.DoesNotExist:
            logger.warning(f"User not found with ID: {user_id}")
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in FriendshipStatusView: {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]


class LoginView(APIView):
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        logger.info(f"Login attempt: username={username}, email={email}, password={'***' if password else None}")

        if not password:
            logger.warning("Login failed: Password is missing")
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not (username or email):
            logger.warning("Login failed: Neither username nor email provided")
            return Response({'error': 'Username or email is required'}, status=status.HTTP_400_BAD_REQUEST)

        authenticated_user = None
        if email:
            authenticated_user = authenticate(request, email=email, password=password)
            if not authenticated_user:
                logger.info(f"No user found or invalid password for email: {email}")
        elif username:
            try:
                user = User.objects.get(username=username)
                authenticated_user = authenticate(request, email=user.email, password=password)
            except User.DoesNotExist:
                logger.info(f"No user found with username: {username}")
                authenticated_user = None

        if authenticated_user is None:
            logger.info(f"Authentication failed for: {username or email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        if authenticated_user.is_2fa_enabled:
            logger.info(f"2FA required for user: {authenticated_user.username}")
            refresh = RefreshToken.for_user(authenticated_user)
            return Response({
                'status': '2fa_required',
                'user_id': authenticated_user.id,
                'temporary_token': str(refresh.access_token)
            }, status=status.HTTP_200_OK)

        refresh = RefreshToken.for_user(authenticated_user)
        logger.info(f"User {authenticated_user.username} logged in successfully (no 2FA)")
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if not all([username, email, password]):
            return Response({'error': 'Username, email, and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name or '',
                last_name=last_name or ''
            )
            logger.info(f"User created: username={user.username}, id={user.id}, type={type(user)}")
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            return Response({'error': 'Failed to create user'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not isinstance(user, User):
            logger.error(f"User is not a User instance: {user}, type={type(user)}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Failed to generate tokens: {str(e)}")
            return Response({'error': 'Failed to generate tokens'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Verify2FAView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        temporary_token = request.data.get('temporary_token')
        code = request.data.get('code')

        if not temporary_token or not code:
            logger.warning("2FA verification failed: Missing token or code")
            return Response({'error': 'Temporary token and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = AccessToken(temporary_token)
            user_id = token['user_id']
            user = User.objects.get(id=user_id)
        except Exception as e:
            logger.error(f"Invalid temporary token: {str(e)}")
            return Response({'error': 'Invalid or expired temporary token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            for device in devices_for_user(user):
                if device.verify_token(code):
                    refresh = RefreshToken.for_user(user)
                    logger.info(f"2FA verified successfully for user: {user.username}")
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(user).data
                    }, status=status.HTTP_200_OK)
            logger.warning(f"Invalid 2FA code for user: {user.username}")
            return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            logger.error("User not found during 2FA verification")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error during 2FA verification: {str(e)}")
            return Response({'error': 'Verification failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.order_by('-wins')[:10]
        serializer = PublicUserSerializer(users, many=True)
        return Response(serializer.data)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        # If user_id is provided, fetch that user's dashboard
        # Otherwise, fetch the current user's dashboard
        if user_id:
            try:
                # Check if user_id is numeric or a username
                if user_id.isdigit():
                    logger.info(f"Looking up dashboard for numeric ID: {user_id}")
                    user = User.objects.get(id=user_id)
                else:
                    logger.info(f"Looking up dashboard for username: {user_id}")
                    # Try exact match first, then case-insensitive
                    try:
                        user = User.objects.get(username=user_id)
                    except User.DoesNotExist:
                        user = User.objects.filter(username__iexact=user_id).first()
                        if not user:
                            logger.warning(f"User not found with username: {user_id}")
                            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                            
                logger.info(f"Fetching dashboard for user: {user.username} (ID: {user.id})")
            except User.DoesNotExist:
                logger.warning(f"User not found with ID: {user_id}")
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error in DashboardView: {str(e)}")
                return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            user = request.user
            logger.info(f"Fetching dashboard for current user: {user.username}")
        
        games = Game.objects.filter(players=user)
        data = {
            'total_games': user.total_games,
            'wins': user.wins,
            'losses': user.losses,
            'draws': user.draws,
            'win_rate': user.win_rate,
            'game_history': GameSerializer(games, many=True).data if games.exists() else []
        }
        return Response(data)


class IsAuthenticatedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'authenticated': True}, status=status.HTTP_200_OK)


class CustomTokenRefreshView(TokenRefreshView):
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except User.DoesNotExist:
            return Response(
                {'error': 'User associated with this token no longer exists'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except InvalidToken as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('search', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        users = User.objects.filter(
            Q(username__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:5]
        serializer = PublicUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        recipient_id = self.request.query_params.get('recipient_id')
        if recipient_id:
            return Message.objects.filter(
                (Q(sender=user) & Q(recipient_id=recipient_id)) |
                (Q(sender_id=recipient_id) & Q(recipient=user))
            ).order_by('timestamp')
        return Message.objects.filter(Q(sender=user) | Q(recipient=user)).order_by('timestamp')
