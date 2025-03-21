from django.contrib import admin
from .models import Game, GameState, PlayerQueue

# Register your models here.
@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('room_name', 'created_at', 'is_active', 'player1_id', 'player2_id', 'winner_id')
    list_filter = ('is_active',)
    search_fields = ('room_name', 'player1_id', 'player2_id')

@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    list_display = ('game', 'player1_score', 'player2_score')
    search_fields = ('game__room_name',)

@admin.register(PlayerQueue)
class PlayerQueueAdmin(admin.ModelAdmin):
    list_display = ('player_id', 'joined_at', 'is_matched', 'game')
    list_filter = ('is_matched',)
    search_fields = ('player_id',)
