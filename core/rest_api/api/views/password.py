from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from ..models import Tuser
from ..utils.jwt_utils import send_otp_email
from zxcvbn import zxcvbn
import binascii
import os
from django.conf import settings

@api_view(['POST'])
def forgot_password(request):
    """Handle forgot password request"""
    email = request.data.get('email')
    user = Tuser.objects.filter(email=email).first()
    
    if user:
        user.fp_token = binascii.hexlify(os.urandom(32)).decode()
        user.save()
        
        reset_link = f"{settings.FRONT_URL}/resetPassword?token={user.fp_token}"
        send_otp_email(
            user.email,
            reset_link,
            'Password Reset Request'
        )
    
    return Response({
        'success': 'If email exists, reset instructions have been sent'
    })

@api_view(['POST'])
def reset_password(request):
    """Handle password reset"""
    token = request.data.get('token')
    new_password = request.data.get('password')
    
    user = Tuser.objects.filter(fp_token=token).first()
    if not user:
        return Response({
            'error': 'Invalid or expired reset token'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if zxcvbn(new_password)['score'] < 3:
        return Response({
            'error': 'Password is too weak. Include uppercase, numbers and symbols.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.password_hash = make_password(new_password)
    user.fp_token = ''  # Clear the reset token
    user.save()
    
    return Response({
        'success': 'Password has been reset successfully'
    })

@api_view(['GET'])
def check_reset_token(request):
    """Verify if a password reset token is valid"""
    token = request.query_params.get('token')
    
    user = Tuser.objects.filter(fp_token=token).first()
    if not user:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': 'Valid token'
    }) 
