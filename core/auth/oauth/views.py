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

# Helper function to add CORS headers to all responses
def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = settings.FRONTEND_URL
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Max-Age"] = "86400"  # 24 hours
    return response

class FortyTwoLoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        return add_cors_headers(response)
    
    def get(self, request):
        # Construct the 42 OAuth URL with correct parameters
        client_id = settings.FORTYTWO_CLIENT_ID
        redirect_uri = settings.FORTYTWO_REDIRECT_URI
        
        logger.debug(f"OAuth parameters: client_id={client_id}, redirect_uri={redirect_uri}")
        
        # Standard OAuth 2.0 authorization code flow parameters
        auth_url = (
            f"https://api.intra.42.fr/oauth/authorize"
            f"?client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"  # This must be 'code' for authorization code flow
            f"&state={request.session.session_key or 'nostate'}"  # Add state parameter for security
        )
        
        logger.info(f"Redirecting to 42 OAuth URL: {auth_url}")
        response = HttpResponseRedirect(auth_url)
        return add_cors_headers(response)

class FortyTwoCallbackView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated access
    
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        return add_cors_headers(response)
    
    def get(self, request):
        logger.debug(f"Callback received - Full URL: {request.build_absolute_uri()}")
        logger.debug(f"Request GET params: {request.GET}")
        code = request.GET.get('code')
        
        if not code:
            logger.error("No authorization code provided")
            error_msg = request.GET.get('error', 'Authorization code not provided')
            error_description = request.GET.get('error_description', '')
            logger.error(f"OAuth error: {error_msg} - {error_description}")
            response = JsonResponse({
                'error': error_msg,
                'error_description': error_description
            }, status=400)
            return add_cors_headers(response)

        try:
            # Exchange code for access token
            token_url = 'https://api.intra.42.fr/api/oauth/token'
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
                response = JsonResponse({
                    'error': f'Failed to authenticate with 42: {token_response.text}'
                }, status=400)
                return add_cors_headers(response)
                
            token_json = token_response.json()
            logger.debug(f"Token exchange successful: {token_json.keys()}")
            access_token = token_json['access_token']
            
            # Get user info from 42 API
            user_info_url = 'https://api.intra.42.fr/v2/me'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_response = requests.get(user_info_url, headers=headers)
            
            if not user_response.ok:
                logger.error(f"User info request failed: {user_response.status_code} - {user_response.text}")
                response = JsonResponse({
                    'error': f'Failed to get user info from 42: {user_response.text}'
                }, status=400)
                return add_cors_headers(response)
                
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
                'is_active': user.is_active,
            }
            
            # Encode the data for URL
            response_data = {
                'user': user_info,
                'tokens': tokens,
                'authSuccess': True,
            }
            encoded_data = urllib.parse.quote(json.dumps(response_data))
            
            # Create redirect URL with data
            redirect_url = f"{settings.FRONTEND_URL}/home?data={encoded_data}"
            logger.debug(f"Redirecting to frontend URL: {redirect_url}")
            
            # Create HTML response with JavaScript redirection and cookie setting
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
                <script>
                    // Set secure cookies
                    function setCookie(name, value, days, path = '/') {{
                        const date = new Date();
                        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                        const expires = `expires=${{date.toUTCString()}}`;
                        document.cookie = `${{name}}=${{value}}; ${{expires}}; path=${{path}}; SameSite=Lax`;
                        console.log(`Set cookie: ${{name}}`);
                    }}
                    
                    // Store authentication data
                    const authData = {json.dumps(response_data)};
                    
                    // These cookies are also set by the server, but we set them here as backup
                    setCookie('userData', JSON.stringify(authData.user), 7);
                    setCookie('authSuccess', 'true', 7);
                    
                    // We don't set the sensitive tokens here since the server will set them as HttpOnly
                    
                    // For debugging
                    console.log("Authentication successful");
                    
                    // Wait a moment to ensure cookies are set, then redirect
                    setTimeout(() => {{
                        console.log("Cookies set, redirecting to {settings.FRONTEND_URL}/home");
                        window.location.href = "{settings.FRONTEND_URL}/home";
                    }}, 1000);
                </script>
                <meta http-equiv="refresh" content="2;url={redirect_url}">
            </head>
            <body>
                <h1>Authentication Successful!</h1>
                <p>You will be redirected automatically in 2 seconds.</p>
                <p>If you are not redirected, <a href="{redirect_url}">click here</a>.</p>
            </body>
            </html>
            """
            response = HttpResponse(html, content_type='text/html')
            
            # Set cookies in the response for added security
            max_age_access = 60 * 60 * 24  # 1 day in seconds
            max_age_refresh = 60 * 60 * 24 * 7  # 7 days in seconds
            
            # Set the access token cookie - httponly for security
            response.set_cookie(
                'accessToken', 
                tokens['access'], 
                max_age=max_age_access, 
                httponly=True,  # True because we don't need JS access to this sensitive token
                samesite='Lax', 
                secure=settings.SESSION_COOKIE_SECURE  # Use the Django setting
            )
            
            # Set the refresh token cookie - httponly for security
            response.set_cookie(
                'refreshToken', 
                tokens['refresh'], 
                max_age=max_age_refresh, 
                httponly=True,  # True because we don't need JS access to this sensitive token 
                samesite='Lax', 
                secure=settings.SESSION_COOKIE_SECURE
            )
            
            # Set the user data cookie - NOT httponly so JavaScript can read it
            response.set_cookie(
                'userData', 
                json.dumps(user_info), 
                max_age=max_age_refresh, 
                httponly=False,  # False because we need JS access to user data
                samesite='Lax', 
                secure=settings.SESSION_COOKIE_SECURE
            )
            
            # Add another non-httponly cookie to signal authentication success
            response.set_cookie(
                'authSuccess', 
                'true', 
                max_age=max_age_refresh,
                httponly=False,  # False so JavaScript can detect login state
                samesite='Lax',
                secure=settings.SESSION_COOKIE_SECURE
            )
            
            return add_cors_headers(response)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error during OAuth flow: {str(e)}")
            traceback.print_exc()
            response = JsonResponse({
                'error': f'Failed to authenticate with 42: {str(e)}'
            }, status=500)
            return add_cors_headers(response)
        except Exception as e:
            logger.error(f"Unexpected error during OAuth callback: {str(e)}")
            traceback.print_exc()
            response = JsonResponse({
                'error': f'An unexpected error occurred: {str(e)}'
            }, status=500)
            return add_cors_headers(response) 
        
class TokenView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({"message": "Token endpoint reached"}, status=200)
