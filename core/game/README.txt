# Pong Game - Quick Start Guide

## Setup

1. Activate the virtual environment:
   ```
   .\venv\Scripts\Activate  # Windows
   source venv/bin/activate  # Unix/macOS
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Apply database migrations:
   ```
   python manage.py makemigrations game_app
   python manage.py migrate
   ```

4. Run the server:
   ```
   python manage.py runserver
   ```

5. Access the game at http://localhost:8000/

## How to Play

1. Share the game URL with a friend to play together (make sure you both use the same room name parameter)
2. Control your paddle with mouse movements
3. First player to reach 5 points wins

## Features

- Real-time multiplayer with WebSockets
- Physics-based ball movement
- Score tracking
- In-game chat
- Multiple game rooms

For more details, see README.md 