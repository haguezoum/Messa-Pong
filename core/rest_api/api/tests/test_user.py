import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import Tuser

@pytest.mark.django_db
def test_get_user_profile(api_client, user):
    api_client.force_authenticate(user=user)
    response = api_client.get(reverse('user-self'))
    assert response.status_code == 200
    assert response.data['username'] == user.username

@pytest.mark.django_db
def test_update_user_profile(api_client, user):
    api_client.force_authenticate(user=user)
    response = api_client.post(reverse('user-update_profile'), {
        'bio': 'Updated bio'
    })
    assert response.status_code == 200
    assert response.data['bio'] == 'Updated bio' 