from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    LoginSerializer
)

User = get_user_model()


class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        login = serializer.validated_data['login']
        password = serializer.validated_data['password']

        # Try to find user by email or username
        try:
            user = User.objects.get(Q(email=login) | Q(username=login))
        except User.DoesNotExist:
            return Response({
                'error': 'No account found with this email or username.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verify password
        if not user.check_password(password):
            return Response({
                'error': 'Incorrect password. Please try again.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                # Automatically log in the user
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    },
                    'message': 'Registration successful'
                }, status=status.HTTP_201_CREATED)
            
            # Improve error messages
            errors = {}
            for field, error_list in serializer.errors.items():
                if field == 'email' and 'unique' in str(error_list[0]):
                    errors[field] = 'This email is already registered. Please use a different email or try logging in.'
                elif field == 'username' and 'unique' in str(error_list[0]):
                    errors[field] = 'This username is already taken. Please choose another one.'
                else:
                    errors[field] = str(error_list[0])
            
            return Response({
                'errors': errors,
                'message': 'Validation failed'
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Registration error: {str(e)}")  # Log the error
            return Response({
                'error': 'An error occurred during registration. Please try again.',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user 