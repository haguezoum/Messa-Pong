from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..utils.jwt_utils import send_otp_email
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def challenge_2fa(request):
    """Handle 2FA challenge verification"""
    user = request.user
    otp = request.data.get('otp')

    if not user.tfa_enabled:
        return Response({
            'error': 'Two-factor authentication is not enabled'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not user.tfa_locked:
        return Response({
            'success': 'Account already unlocked'
        })

    if int(otp) == user.tfa_otp:
        user.tfa_locked = False
        user.save()
        return Response({
            'success': 'Account unlocked'
        })

    return Response({
        'error': 'Invalid OTP'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_2fa(request):
    """Enable or disable 2FA for a user"""
    user = request.user
    
    user.tfa_enabled = not user.tfa_enabled
    user.tfa_locked = False if user.tfa_enabled else True
    user.save()

    status_text = 'enabled' if user.tfa_enabled else 'disabled'
    return Response({
        'success': f'Two-factor authentication is {status_text}'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_2fa_code(request):
    """Send new 2FA code to user"""
    user = request.user
    
    if not user.tfa_enabled:
        return Response({
            'error': 'Two-factor authentication is not enabled'
        }, status=status.HTTP_400_BAD_REQUEST)

    user.tfa_otp = int.from_bytes(os.urandom(2), byteorder='big')
    user.save()
    
    send_otp_email(
        user.email,
        user.tfa_otp,
        'Two-Factor Authentication Code'
    )
    
    return Response({
        'success': 'New 2FA code sent'
    }) 
