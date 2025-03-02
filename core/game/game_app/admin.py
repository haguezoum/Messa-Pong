from django.contrib import admin
from .models import Game, GameState

# Register your models here.
@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('room_name', 'created_at', 'is_active', 'is_full', 'is_finished')
    search_fields = ('room_name', 'player1_id', 'player2_id')
    list_filter = ('is_active', 'created_at')

@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    list_display = ('game', 'player1_score', 'player2_score')
    search_fields = ('game__room_name',)
