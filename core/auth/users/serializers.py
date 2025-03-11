from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.validators import RegexValidator
import re

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            'required': 'Please confirm your password.'
        }
    )
    email = serializers.EmailField(
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message='Please enter a valid email address.'
            )
        ]
    )
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'username', 'email', 'password', 'password2')
        extra_kwargs = {
            'first_name': {
                'required': True,
                'error_messages': {
                    'required': 'First name is required to complete your registration.'
                }
            },
            'last_name': {
                'required': True,
                'error_messages': {
                    'required': 'Last name is required to complete your registration.'
                }
            },
            'username': {
                'required': True,
                'error_messages': {
                    'required': 'Username is required to complete your registration.',
                    'unique': 'This username is already taken. Please choose another one.'
                }
            },
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Email is required to complete your registration.',
                    'unique': 'This email is already registered. Please use a different email.',
                    'invalid': 'Please enter a valid email address.'
                }
            },
            'password': {
                'write_only': True,
                'required': True,
                'error_messages': {
                    'required': 'Password is required to complete your registration.'
                }
            }
        }

    def validate(self, data):
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({
                'password2': 'The passwords do not match. Please try again.'
            })
        
        # Validate password strength
        password = data.get('password')
        if len(password) < 8:
            raise serializers.ValidationError({
                'password': 'Password must be at least 8 characters long.'
            })
        
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        # Add more custom claims if needed

        return token


class LoginSerializer(serializers.Serializer):
    login = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        login = data.get('login')
        if not login:
            raise serializers.ValidationError({
                'login': 'Please enter your email or username.'
            })
        return data 