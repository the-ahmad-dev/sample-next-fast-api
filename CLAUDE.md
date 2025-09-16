# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack application with a FastAPI backend and Next.js frontend:

- **Backend**: FastAPI (Python) located in `/backend/` and main entry at `main.py`
- **Frontend**: Next.js (TypeScript/React) located in `/frontend/`
- **API Client**: Auto-generated from OpenAPI spec using `@hey-api/openapi-ts`

### Key Backend Components

- `main.py`: FastAPI app entry point with health check and frontend serving
- `backend/core/config.py`: Pydantic settings from environment variables
- `backend/core/logging.py`: Structured logging setup
- `backend/core/middleware.py`: Request middleware configuration
- `backend/models.py`: SQLModel database models for User and Organization
- Environment configuration loaded from `.env` file

### Frontend Structure

- Built with Next.js 15, React 19, TypeScript
- Uses Radix UI components with Tailwind CSS
- API client generated in `frontend/app/client/` from `openapi.json`
- Configuration in `frontend/openapi-ts.config.ts`

## Development Commands

### Backend (Python)
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Code formatting
black .
isort .
```

### Frontend (Next.js)
```bash
cd frontend

# Install dependencies
pnpm install

# Development server
pnpm dev

# Build production
pnpm build

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Type checking
pnpm type-check

# Generate API client from OpenAPI spec
pnpm generate-client
```

### Full Stack Development

The application serves the frontend from the FastAPI backend. After building the frontend with `pnpm build`, run the Python server to serve both frontend and API.

### Docker

```bash
# Build and run with Docker
docker build -t sample-app .
docker run -p 8080:8080 sample-app
```

## API Client Generation

The frontend uses auto-generated API clients from the OpenAPI specification:
1. Backend exposes OpenAPI spec
2. Frontend uses `@hey-api/openapi-ts` to generate TypeScript client
3. Generated client available in `frontend/app/client/`

Run `pnpm generate-client` in frontend directory when backend API changes.

## Database Models

Uses SQLModel for database models with the following pattern:
- **Base Classes**: `UserBase`, `OrganizationBase` - Pydantic models with common fields
- **Table Classes**: `User`, `Organization` - SQLModel with `table=True` for database tables
- **Response Classes**: `UserPublic`, `OrganizationPublic` - API response models

### Model Structure
- **User**: email, username, full_name, is_active, is_admin, is_superuser, organization_id
- **Organization**: name, description, is_active
- **Relationships**: Organization has many Users, User belongs to Organization
- All models include id (UUID), created_at, updated_at timestamps

## Environment Configuration

Backend uses Pydantic settings with environment variables loaded from `.env`. Key settings include CORS origins, server configuration, request limits, and database configuration.

### Database Setup
- PostgreSQL database with configuration in `.env`
- Default settings: localhost:5432, database: `sample_app_db`
- SQLModel models with automatic migrations via Alembic
- Database URL automatically constructed from environment variables

### Database Migrations
```bash
# Generate new migration after model changes
./venv/bin/alembic revision --autogenerate -m "Description of changes"

# Apply migrations to database
./venv/bin/alembic upgrade head

# Check current migration status
./venv/bin/alembic current

# View migration history
./venv/bin/alembic history
```