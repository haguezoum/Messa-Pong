# Messa Pong 
A PING PONG online game SPA with microservice architecture.
![Ping Pong Match](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzZ3YjRpdDd4Z2tkNDI3bnZhaWY3eG5pNHQ3bDV1dmtjcXF2c3F6NSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/14f1yB1YECQHFHBIcB/giphy.gif)

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

## Features
- Real-time multiplayer gameplay
- User authentication and profiles
- Leaderboard system
- Matchmaking functionality
- Cross-platform web-based interface

## Architecture Overview

### Frontend
- Web Components (Pure JavaScript)
  - Custom elements for game UI
  - Shadow DOM for encapsulation
  - Event-driven architecture
  - Pure Css for styling

### Backend
- Django REST Framework
  - API endpoints for game logic
  - Authentication & user management
  - Database models

### Microservices
- Game Engine Service
- User Management Service
- Score Tracking Service
- Matchmaking Service

### Infrastructure
- Docker containers for each service
- Docker Compose for orchestration
- Nginx as reverse proxy
- PostgreSQL for data storage

## Prerequisites
- Docker & Docker Compose (v20.10+)
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL (v13+)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/haguezoum/ft_transcendence.git
cd ft_transcendence
```



### Development Mode

2. Make using Makefile:
```bash
make
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost

## Contributing
Special thanks for all the tesm member who contrubute on this project :
- [Hassan Aguezoum](https://github.com/haguezoum) - Project Lead & Frontend Developer
- [Ayoub Et Tass](https://github.com/aet-tass) - Backend Developer
- [Tarazan](https://github.com/7ARZAN) - DevOps & Backend Developer
- [Mohamed Elalj](https://github.com/elaljo) - UI/UX Designer & Frontend Developer
- [Mohammed Belouarraq](https://github.com/mbelouar) - FullStack Developer

## Special Thanks
We would like to extend our gratitude to the AMADIL tool that helped us manage and structure our project efficiently.

### AMADIL
[AMADIL](https://www.npmjs.com/package/amadil) is a powerful package that helps you build projects by generating JavaScript components and pages with their respective routes. It provides a seamless development experience, allowing you to quickly scaffold and organize your project structure.

Key features:
- Single page web application generation
- Component and page scaffolding
- Route management
- Project structure organization

For more information, visit:
- [NPM Package](https://www.npmjs.com/package/amadil)
- [GitHub Repository](https://github.com/haguezoum/amadil)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
