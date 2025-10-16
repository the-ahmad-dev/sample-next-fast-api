# Sample

Modern full-stack web application with FastAPI backend and Next.js 15 frontend.

## Features

- **Authentication** - JWT tokens, 2FA (TOTP), email verification
- **User Management** - Profile, password management, OAuth-ready
- **Security** - Rate limiting (Redis), password hashing (bcrypt)
- **Modern Stack** - FastAPI, Next.js 15, React 19, TypeScript, PostgreSQL
- **Developer Experience** - Auto-generated API client, hot reload, type safety

## Tech Stack

**Backend:**

- Python 3.11, FastAPI 0.115, SQLModel
- PostgreSQL, Redis, SendGrid

**Frontend:**

- Next.js 15, React 19, TypeScript
- Tailwind CSS, shadcn/ui

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+
- Redis
- pnpm

### Installation

1. **Clone and setup:**

   ```bash
   git clone https://github.com/the-ahmad-dev/sample-next-fast-api.git
   cd sample-next-fast-api
   ```

2. **Backend:**

   ```bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install dependencies
   ./venv/bin/pip install -r requirements.txt

   # Configure environment
   cp .env.example .env
   # Edit .env with your settings

   # Start Redis
   docker run -d --name redis -p 6379:6379 redis:alpine

   # Run migrations
   alembic upgrade head

   # Start server
   ./venv/bin/python -m uvicorn main:app --reload
   ```

   Backend runs on http://localhost:8000

3. **Frontend:**

   ```bash
   cd frontend
   pnpm install
   pnpm generate-client  # Generate API client from backend
   pnpm dev
   ```

   Frontend runs on http://localhost:3000

## Development

### Code Formatting

```bash
# Python (required after every change)
./venv/bin/isort backend/ --profile black
./venv/bin/black backend/

# Frontend
cd frontend && pnpm lint
```

### Database Migrations

```bash
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Testing

```bash
./venv/bin/pytest
```

## Architecture

This project follows a layered architecture pattern:

```
API Layer → Service Layer → DB Layer → Model Layer
```

- **One session per request, one commit per endpoint**
- **Centralized exception handling**
- **Modular system** with lazy-loaded feature modules
- **Rate limiting** (per-user for authenticated, per-IP for anonymous)

For detailed architecture guidelines, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Documentation

- **ARCHITECTURE.md** - Complete backend architecture and patterns
- **CLAUDE.md** - Development guide and commands
- **frontend/DESIGN_SYSTEM.md** - Frontend design system
- **API Docs** - http://localhost:8000/docs (Swagger UI)

## Project Structure

```
sample-next-fast-api/
├── backend/              # FastAPI application
│   ├── core/             # Core utilities (auth, db, email, rate limiting)
│   ├── modules/          # Feature modules (user, two_fa, forgot_password)
│   └── models.py         # Database models
├── frontend/             # Next.js 15 application
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities (auth, token, error handling)
│   └── constants/        # Design tokens
├── main.py               # FastAPI entry point
├── alembic.ini           # Database migrations config
└── requirements.txt      # Python dependencies
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Essential variables
APP_NAME=Sample
JWT_SECRET_KEY=your-secret-key
POSTGRES_DB=sample_db
POSTGRES_PASSWORD=your-password
REDIS_URL=redis://localhost:6379/0
SENDGRID_API_KEY=your-api-key
```

See `.env.example` for complete list.

## Deployment

### Docker

```bash
docker build -t sample:latest .
docker run -d -p 8000:8000 sample:latest
```

### Manual

1. Configure all environment variables
2. Run migrations: `alembic upgrade head`
3. Start backend: `uvicorn main:app`
4. Build frontend: `cd frontend && pnpm build`
5. Serve frontend with backend or separately

## License

Proprietary

## Support

- **Issues:** https://github.com/the-ahmad-dev/sample-next-fast-api/issues
- **Documentation:** See ARCHITECTURE.md and CLAUDE.md
