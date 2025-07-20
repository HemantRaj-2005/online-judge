# TapasCode - An Online Judge Platform

A full-stack online coding judge platform with Django backend and React frontend.

## Features

- **Backend (Django)**
  - User authentication system
  - Problem management
  - Code submission and judging
  - Interview question bank
  - AI-assisted coding help

- **Frontend (React)**
  - Responsive UI
  - Code editor with syntax highlighting
  - Real-time submission results
  - User profile management

## Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (for local execution environment)

## Installation

### Backend Setup
1. Create and activate virtual environment
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start development server: `python manage.py runserver`

### Frontend Setup
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`

## Configuration

Copy `.env.example` to `.env` and configure environment variables.

## Deployment

The project includes Dockerfiles for containerized deployment.

## License

MIT