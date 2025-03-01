# Django REST API with JWT Authentication and 2FA

This is a Django REST API for authentication with JWT and Two-Factor Authentication. It provides endpoints for user registration, login, token refresh, profile retrieval, and 2FA setup and verification.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start the server:
```bash
python manage.py runserver
```

## API Endpoints

### Authentication

#### Register
- **URL**: `/api/register/`
- **Method**: `POST`
- **Body**:
```json
{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_password",
    "password2": "your_password"
}
```
- **Response**: User details and JWT tokens

#### Login
- **URL**: `/api/login/`
- **Method**: `POST`
- **Body**:
```json
{
    "email": "your_email@example.com",
    "password": "your_password"
}
```
- **Response**: JWT tokens

#### Token Refresh
- **URL**: `/api/token/refresh/`
- **Method**: `POST`
- **Body**:
```json
{
    "refresh": "your_refresh_token"
}
```
- **Response**: New access token

#### Profile
- **URL**: `/api/profile/`
- **Method**: `GET`
- **Headers**:
```
Authorization: Bearer your_access_token
```
- **Response**: User profile information

## Testing with Postman

### Option 1: Import Collection and Environment

1. **Start the Django server**:
```bash
cd core/auth
python manage.py runserver
```

2. **Import the Postman Collection and Environment**:
   - Open Postman
   - Click on "Import" in the top left
   - Select the files `Django_Auth_API.postman_collection.json` and `Django_Auth_API.postman_environment.json`
   - Select the "Django Auth API" environment from the dropdown in the top right

3. **Run the Requests**:
   - Run the "Register" request first (or "Login" if you already have a user)
   - The collection includes scripts to automatically save tokens to environment variables
   - Run the "Profile" request to test authentication
   - Run the "Token Refresh" request to get a new access token

### Option 2: Manual Setup

1. **Start the Django server**:
```bash
cd core/auth
python manage.py runserver
```

2. **Create a new collection in Postman**:
   - Name it "Django Auth API"

3. **Test Registration**:
   - Create a new POST request to `http://localhost:8000/api/register/`
   - Set the body to raw JSON with username, email, password, and password2
   - Send the request and verify the 201 Created response

4. **Test Login**:
   - Create a new POST request to `http://localhost:8000/api/login/`
   - Set the body to raw JSON with email and password
   - Send the request and verify the 200 OK response
   - Copy the access token from the response

5. **Test Profile**:
   - Create a new GET request to `http://localhost:8000/api/profile/`
   - Set the Authorization type to Bearer Token and paste the access token
   - Send the request and verify the 200 OK response

6. **Test Token Refresh**:
   - Create a new POST request to `http://localhost:8000/api/token/refresh/`
   - Set the body to raw JSON with the refresh token
   - Send the request and verify the 200 OK response
   - Copy the new access token

7. **Test Profile with New Token**:
   - Update the Bearer Token in the Profile request with the new access token
   - Send the request and verify it still works

## Docker

You can also run the API using Docker:

```bash
docker build -t auth-api .
docker run -p 8000:8000 auth-api
``` 