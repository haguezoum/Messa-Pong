import requests
import json
import logging
from urllib.parse import urlencode
from datetime import datetime, timedelta

from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OAuth42Profile
from users.serializers import UserSerializer

logger = logging.getLogger(__name__)
User = get_user_model()

class OAuth42RedirectView(APIView):
    """
    View to redirect user to 42 OAuth authorization page
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Prepare the authorization URL
            auth_params = {
                'client_id': settings.OAUTH_42_CLIENT_ID,
                'redirect_uri': settings.OAUTH_42_REDIRECT_URI,
                'response_type': 'code',
                'scope': 'public',  # Adjust scopes as needed
                'state': 'random_state_string',  # Should be generated dynamically in production
            }
            
            authorization_url = f"https://api.intra.42.fr/oauth/authorize?{urlencode(auth_params)}"
            
            return Response({
                'authorization_url': authorization_url
            })
        except Exception as e:
            logger.error(f"42 OAuth redirect error: {e}")
            return Response({
                'error': 'Failed to generate authorization URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OAuth42CallbackView(APIView):
    """
    Handle callback from 42 OAuth
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            code = request.data.get('code')
            if not code:
                return Response({
                    'error': 'Authorization code is required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Exchange code for tokens
            token_url = "https://api.intra.42.fr/oauth/token"
            token_payload = {
                'grant_type': 'authorization_code',
                'client_id': settings.OAUTH_42_CLIENT_ID,
                'client_secret': settings.OAUTH_42_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.OAUTH_42_REDIRECT_URI,
            }
            
            token_response = requests.post(token_url, data=token_payload)
            
            if token_response.status_code != 200:
                logger.error(f"42 OAuth token error: {token_response.text}")
                return Response({
                    'error': 'Failed to retrieve access token'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            token_data = token_response.json()
            access_token = token_data.get('access_token')
            refresh_token = token_data.get('refresh_token')
            expires_in = token_data.get('expires_in', 7200)  # Default to 2 hours
            
            # Get user info from 42 API
            user_url = "https://api.intra.42.fr/v2/me"
            headers = {
                'Authorization': f"Bearer {access_token}"
            }
            
            user_response = requests.get(user_url, headers=headers)
            
            if user_response.status_code != 200:
                logger.error(f"42 API user data error: {user_response.text}")
                return Response({
                    'error': 'Failed to retrieve user information'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            user_data = user_response.json()
            
            # Process user data and create/update user
            oauth_id = str(user_data.get('id'))
            email = user_data.get('email')
            login = user_data.get('login')
            first_name = user_data.get('first_name', '')
            last_name = user_data.get('last_name', '')
            avatar_url = user_data.get('image', {}).get('link', '')
            
            # Check if user exists with this OAuth ID
            try:
                oauth_profile = OAuth42Profile.objects.get(oauth_id=oauth_id)
                user = oauth_profile.user
                # Update token information
                oauth_profile.access_token = access_token
                oauth_profile.refresh_token = refresh_token
                oauth_profile.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
                oauth_profile.save()
            except OAuth42Profile.DoesNotExist:
                # Try to match by email
                try:
                    user = User.objects.get(email=email)
                    # Link existing user to OAuth
                    user.oauth_42_id = oauth_id
                    user.save()
                except User.DoesNotExist:
                    # Create new user
                    user = User.objects.create(
                        username=login,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        oauth_42_id=oauth_id,
                        avatar_url=avatar_url
                    )
                    # Set unusable password since login is via OAuth
                    user.set_unusable_password()
                    user.save()
                
                # Create OAuth profile
                OAuth42Profile.objects.create(
                    user=user,
                    oauth_id=oauth_id,
                    access_token=access_token,
                    refresh_token=refresh_token,
                    token_expires_at=timezone.now() + timedelta(seconds=expires_in),
                    email=email,
                    avatar_url=avatar_url,
                    display_name=login
                )
            
            # Generate JWT tokens for our app
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
            
        except Exception as e:
            logger.error(f"42 OAuth callback error: {str(e)}")
            return Response({
                'error': 'OAuth authentication failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
