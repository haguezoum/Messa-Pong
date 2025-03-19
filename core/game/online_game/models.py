from django.db import models
import uuid

# Create your models here.

class Game(models.Model):
    """Model representing a game session."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    player1_id = models.CharField(max_length=100, blank=True, null=True)
    player2_id = models.CharField(max_length=100, blank=True, null=True)
    winner_id = models.CharField(max_length=100, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Game {self.room_name}"
    
    @property
    def is_full(self):
        return bool(self.player1_id and self.player2_id)
    
    @property
    def is_finished(self):
        return bool(self.winner_id)
        
class GameState(models.Model):
    """Model representing the current state of a game."""
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name='state')
    ball_x = models.FloatField(default=50.0)  # Position as percentage of canvas width
    ball_y = models.FloatField(default=50.0)  # Position as percentage of canvas height
    ball_dx = models.FloatField(default=0.5)  # Ball horizontal velocity
    ball_dy = models.FloatField(default=0.5)  # Ball vertical velocity
    player1_position = models.FloatField(default=50.0)  # Paddle position as percentage
    player2_position = models.FloatField(default=50.0)  # Paddle position as percentage
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    
    def __str__(self):
        return f"State for {self.game}"
