import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import Tuser

@pytest.mark.django_db
def test_send_friend_request(api_client, user, another_user):
    api_client.force_authenticate(user=user)
    response = api_client.post(reverse('friendship-send_friend_request'), {
        'invitee_id': another_user.id
    })
    assert response.status_code == 200
    assert 'success' in response.data 