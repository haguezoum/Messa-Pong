from django.conf import settings
from django.http import HttpResponseRedirect
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
import json
import urllib.parse

User = get_user_model()

class FortyTwoLoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get(self, request):
        # Construct the 42 OAuth URL
        auth_url = (
            f"https://api.intra.42.fr/oauth/authorize"
            f"?client_id={settings.FORTYTWO_CLIENT_ID}"
            f"&redirect_uri={settings.FORTYTWO_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope=public"
        )
        return HttpResponseRedirect(auth_url)

class FortyTwoCallbackView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response(
                {'error': 'Authorization code not provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Exchange code for access token
            token_url = 'https://api.intra.42.fr/oauth/token'
            token_data = {
                'grant_type': 'authorization_code',
                'client_id': settings.FORTYTWO_CLIENT_ID,
                'client_secret': settings.FORTYTWO_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.FORTYTWO_REDIRECT_URI,
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()['access_token']
            
            # Get user info from 42 API
            user_info_url = 'https://api.intra.42.fr/v2/me'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            # Get or create user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['login'],
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'is_active': True,
                }
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
            
            # Prepare user data
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            
            # Encode the data for URL
            encoded_data = urllib.parse.quote(json.dumps({
                'user': user_data,
                'tokens': tokens
            }))
            
            # Redirect to frontend with data
            frontend_url = f"{settings.FRONTEND_URL}/login?data={encoded_data}"
            return HttpResponseRedirect(frontend_url)
            
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Failed to authenticate with 42: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 