from django.contrib.auth.backends import ModelBackend
from .models import User

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, email=None, password=None, oauth_42_id=None, **kwargs):
        if oauth_42_id:
            try:
                user = User.objects.get(oauth_42_id=oauth_42_id)
                return user
            except User.DoesNotExist:
                return None
        elif email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return None
        elif username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None
        else:
            return None
        if password and user.check_password(password):
            return user
        return None
