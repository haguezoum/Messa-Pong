from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import User 
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

@receiver(pre_delete, sender=User)
def blacklist_tokens_on_delete(sender, instance, **kwargs):
    tokens = OutstandingToken.objects.filter(user=instance)
    for token in tokens:
        BlacklistedToken.objects.get_or_create(token=token)
