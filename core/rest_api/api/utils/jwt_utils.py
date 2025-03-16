from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
import os

def create_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def blacklist_token(token):
    """Blacklist a refresh token"""
    try:
        token = RefreshToken(token)
        token.blacklist()
        return True
    except TokenError:
        return False

def get_tokens_for_user(user, response):
    """Generate tokens and set refresh token cookie"""
    tokens = create_tokens_for_user(user)
    response.set_cookie(
        'refresh_token',
        tokens['refresh'],
        httponly=True,
        path='/',
        samesite='Strict',
        secure=not settings.DEBUG
    )
    return tokens['access']

def clear_auth_cookies(response):
    """Clear authentication cookies"""
    response.delete_cookie('refresh_token', path='/')
    return response

def send_otp_email(email, otp, subject='OTP Verification'):
    """Send OTP via email"""
    message = f"Here's your verification OTP: {otp}"
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    ) 