from django.db import models
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver

class ChatRoom(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name', 'created_at']),
        ]

    def GetMessages(self, limit=50):
        cache_key = f'room_messages_{self.id}'
        messages = cache.get(cache_key)
        if messages is None:
            messages = list(self.messages.select_related()
                          .order_by('-timestamp')[:limit])
            cache.set(cache_key, messages, timeout=300)
        return messages

    def ClearCache(self):
        cache.delete(f'room_messages_{self.id}')

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, 
                           related_name='messages', db_index=True)
    username = models.CharField(max_length=100, db_index=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    is_game_invite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['username', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.username}: {self.content}"

class GameInvite(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected')
    ]

    sender = models.CharField(max_length=100, db_index=True)
    receiver = models.CharField(max_length=100, db_index=True)
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, 
                           related_name='game_invites')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, 
                            default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'receiver', 'status']),
        ]

    def __str__(self):
        return f"{self.sender} invited {self.receiver}"

@receiver(post_save, sender=Message)
def ClearRoomCache(sender, instance, **kwargs):
    instance.room.ClearCache() 
