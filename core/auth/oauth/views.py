from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
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
import logging
import traceback

logger = logging.getLogger(__name__)
# Configure console logging to see log output in Docker logs
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
logger.addHandler(console_handler)
logger.setLevel(logging.DEBUG)

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
        logger.info(f"Redirecting to 42 OAuth URL: {auth_url}")
        return HttpResponseRedirect(auth_url)

class FortyTwoCallbackView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def get(self, request):
        logger.debug(f"Callback received - Full URL: {request.build_absolute_uri()}")
        logger.debug(f"Request GET params: {request.GET}")
        code = request.GET.get('code')
        
        if not code:
            logger.error("No authorization code provided")
            return JsonResponse({
                'error': 'Authorization code not provided'
            }, status=400)

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
            
            logger.debug(f"Exchanging code for access token with data: {token_data}")
            token_response = requests.post(token_url, data=token_data)
            
            if not token_response.ok:
                logger.error(f"Token exchange failed: {token_response.status_code} - {token_response.text}")
                return JsonResponse({
                    'error': f'Failed to authenticate with 42: {token_response.text}'
                }, status=400)
                
            token_json = token_response.json()
            logger.debug(f"Token exchange successful: {token_json.keys()}")
            access_token = token_json['access_token']
            
            # Get user info from 42 API
            user_info_url = 'https://api.intra.42.fr/v2/me'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_response = requests.get(user_info_url, headers=headers)
            
            if not user_response.ok:
                logger.error(f"User info request failed: {user_response.status_code} - {user_response.text}")
                return JsonResponse({
                    'error': f'Failed to get user info from 42: {user_response.text}'
                }, status=400)
                
            user_data = user_response.json()
            logger.debug(f"User info received: {user_data.get('login')}")
            
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
            user_info = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            
            # Encode the data for URL
            response_data = {
                'user': user_info,
                'tokens': tokens
            }
            encoded_data = urllib.parse.quote(json.dumps(response_data))
            
            # Create redirect URL
            frontend_url = f"{settings.FRONTEND_URL}/home?data={encoded_data}"
            logger.debug(f"Redirecting to frontend URL: {frontend_url}")
            
            # Create HTML response with JavaScript redirection
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
                <script>
                    console.log("Redirect script executing");
                    console.log("Redirect URL: {frontend_url}");
                    // Use multiple redirection methods for redundancy
                    try {{
                        window.location.href = "{frontend_url}";
                        console.log("Redirect initiated via window.location.href");
                    }} catch(e) {{
                        console.error("Error in redirect:", e);
                        document.write('<p>Redirect failed. <a href="{frontend_url}">Click here</a> to continue.</p>');
                    }}
                </script>
                <meta http-equiv="refresh" content="0;url={frontend_url}">
            </head>
            <body>
                <h1>Authentication Successful!</h1>
                <p>You will be redirected to the application shortly...</p>
                <p>If you are not redirected, <a href="{frontend_url}">click here</a>.</p>
                <p>Debug info: Redirecting to {settings.FRONTEND_URL}/home</p>
            </body>
            </html>
            """
            
            logger.debug("Returning HTML response with JavaScript redirect")
            return HttpResponse(html, content_type='text/html')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error during OAuth flow: {str(e)}")
            traceback.print_exc()
            return JsonResponse({
                'error': f'Failed to authenticate with 42: {str(e)}'
            }, status=500)
        except Exception as e:
            logger.error(f"Unexpected error during OAuth callback: {str(e)}")
            traceback.print_exc()
            return JsonResponse({
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=500) 