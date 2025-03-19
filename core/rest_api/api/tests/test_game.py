import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import Game, Tuser

@pytest.mark.django_db
def test_create_game(api_client, user):
    api_client.force_authenticate(user=user)
    response = api_client.post(reverse('game-create_game'))
    assert response.status_code == 200
    assert 'success' in response.data

@pytest.mark.django_db
def test_register_to_game(api_client, user, game):
    api_client.force_authenticate(user=user)
    response = api_client.post(reverse('game-register_to_game'), {'game_token': game.token})
    assert response.status_code == 200
    assert response.data['success'] == 'Game starting'