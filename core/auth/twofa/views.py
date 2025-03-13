from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import random
import string
import datetime

from .models import TOTPDevice, EmailVerification
from .serializers import (
    TOTPDeviceSerializer,
    TOTPVerifySerializer,
    EmailVerificationSerializer,
    EmailVerificationConfirmSerializer
)

class TOTPSetupView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = TOTPDeviceSerializer

    def get_object(self):
        device, created = TOTPDevice.objects.get_or_create(user=self.request.user)
        return device

class TOTPVerifyView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = TOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        device, created = TOTPDevice.objects.get_or_create(user=request.user)
        
        if device.verify_token(token):
            device.is_verified = True
            device.save()
            return Response({'detail': 'TOTP verification successful'}, status=status.HTTP_200_OK)
        
        return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Generate a random 6-digit code
        code = ''.join(random.choices(string.digits, k=6))
        
        # Set expiration time (10 minutes from now)
        expires_at = timezone.now() + datetime.timedelta(minutes=10)
        
        # Create or update the verification record
        EmailVerification.objects.filter(user=request.user, is_used=False).update(is_used=True)
        verification = EmailVerification.objects.create(
            user=request.user,
            code=code,
            expires_at=expires_at
        )
        
        # Send email with verification code
        subject = 'Your Verification Code'
        message = f'Your verification code is: {code}. It will expire in 10 minutes.'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        
        try:
            send_mail(subject, message, from_email, recipient_list)
            return Response({'detail': 'Verification code sent to your email'}, status=status.HTTP_200_OK)
        except Exception as e:
            verification.delete()
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmailVerificationConfirmView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code']
        
        # Find the latest unused verification code for this user
        try:
            verification = EmailVerification.objects.filter(
                user=request.user,
                is_used=False
            ).latest('created_at')
        except EmailVerification.DoesNotExist:
            return Response({'detail': 'No verification code found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the code is expired
        if verification.is_expired():
            return Response({'detail': 'Verification code has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if the code matches
        if verification.code != code:
            return Response({'detail': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark the code as used
        verification.is_used = True
        verification.save()
        
        return Response({'detail': 'Email verification successful'}, status=status.HTTP_200_OK) 