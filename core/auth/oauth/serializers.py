from rest_framework import serializers
from .models import OAuth42Profile

class OAuth42Serializer(serializers.ModelSerializer):
    """Serializer for 42 OAuth profile data"""
    class Meta:
        model = OAuth42Profile
        fields = (
            'id', 'user', 'oauth_id', 'email', 
            'avatar_url', 'display_name', 'created_at'
        )
        read_only_fields = fields
