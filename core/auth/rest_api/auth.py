from ninja import Router
from ninja.errors import HttpError
from django.http import HttpRequest, HttpResponse
from django.core.files.storage import default_storage
from django.conf import settings
from django.utils.crypto import get_random_string
from requests.exceptions import RequestException
from rest_api.models import Tuser
from .jwt import UserJWTAuth
from .settings import api_settings
import requests
import logging
from urllib.parse import urlencode

router = Router()
logger = logging.getLogger(__name__)

AUTH_URL = (
    f"{settings.API_42_AUTHORIZE_URL}?"
    f"client_id={settings.API_42_CLIENT_ID}&"
    f"redirect_uri={settings.API_42_REDIRECT_URI}&"
    f"response_type=code"
)

@router.get("/auth/42")
def auth_login(request: HttpRequest):
    """Redirect user to 42 API authentication page"""
    return {"auth_url": AUTH_URL}

@router.get("/callback")
def callback(request: HttpRequest, code: str):
    """Handle OAuth2 callback from 42 API"""
    try:
        # Exchange code for access token
        token_response = requests.post(
            settings.API_42_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.API_42_CLIENT_ID,
                "client_secret": settings.API_42_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.API_42_REDIRECT_URI,
            },
            timeout=10
        )
        token_response.raise_for_status()
        token_data = token_response.json()

        # Get user info from 42 API
        user_response = requests.get(
            settings.API_42_USER_INFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        user_response.raise_for_status()
        user_info = user_response.json()

        # Create/update user
        user, created = Tuser.objects.update_or_create(
            username=user_info["login"],
            defaults={
                "email": user_info["email"],
                "fname": user_info["first_name"],
                "lname": user_info["last_name"],
                "verified": True,
            }
        )

        # Handle profile image
        if user_info.get("image", {}).get("link"):
            image_url = user_info["image"]["link"]
            image_name = f"profiles/{user.username}_{get_random_string(8)}"
            user.image.save(image_name, 
                          default_storage.open(requests.get(image_url).content))

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Set secure cookie
        response = HttpResponse()
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite='None',
            path='/',
            max_age=settings.REFRESH_TOKEN_LIFETIME.total_seconds()
        )
        
        return {"access_token": access_token}

    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error during auth: {str(e)}")
        raise HttpError(400, "Authentication failed")
    except Tuser.MultipleObjectsReturned:
        logger.error(f"Duplicate user found: {user_info.get('login')}")
        raise HttpError(400, "User conflict")
    except Exception as e:
        logger.exception("Unexpected error during authentication")
        raise HttpError(500, "Internal server error")