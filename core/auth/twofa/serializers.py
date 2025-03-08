from rest_framework import serializers
from .models import TOTPDevice, EmailVerification

class TOTPDeviceSerializer(serializers.ModelSerializer):
    qr_code = serializers.SerializerMethodField()

    class Meta:
        model = TOTPDevice
        fields = ('id', 'is_verified', 'qr_code')
        read_only_fields = ('id', 'is_verified', 'qr_code')

    def get_qr_code(self, obj):
        return obj.get_qr_code()

class TOTPVerifySerializer(serializers.Serializer):
    token = serializers.CharField(max_length=6, min_length=6)

class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

class EmailVerificationConfirmSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6) 