import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from ..models import Tuser

@pytest.mark.django_db
def test_register_user(api_client):
    response = api_client.post(reverse('auth-register'), {
        'username': 'testuser',
        'password': 'strongpassword',
        'email': 'test@example.com',
        'fname': 'Test',
        'lname': 'User'
    })
    assert response.status_code == 201
    assert 'id' in response.data

@pytest.mark.django_db
def test_login_user(api_client, user):
    response = api_client.post(reverse('auth-login'), {
        'username': user.username,
        'password': 'password'
    })
    assert response.status_code == 200
    assert 'token' in response.data 