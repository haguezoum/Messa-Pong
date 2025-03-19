from django.contrib import admin
from .models import TOTPDevice, EmailVerification

@admin.register(TOTPDevice)
class TOTPDeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_verified', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('secret_key',)

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'is_used', 'created_at', 'expires_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('code',) 