# Sample - Claude Code Reference

FastAPI backend with modular architecture + Next.js 15 frontend.

## Directory Overview

### Active

- `backend/` - Core application
- `frontend/` - Next.js 15 app
- `main.py` - Entry point
- `alembic.ini` - Migrations
- `.env` - Environment config

### NEVER Touch

- `data-engineering/` - Legacy
- `web-app/` - Deprecated
- `testing/` - Old infrastructure

## Frontend Architecture

### Design System

**CRITICAL:** For ANY frontend work, follow `/frontend/DESIGN_SYSTEM.md`

Key principles:

- Use constants from `/frontend/constants/ui.ts`
- Colors: `sample-blue`, `sample-gray` palettes only
- Sections: `py-16 lg:py-20`
- Buttons: `COMPONENT_CLASSES` constants
- Shadows: `shadow-sample` or `shadow-sample-sm`
- NO hardcoded colors or arbitrary values

### Directory Structure

```
frontend/
├── app/              # Next.js 15 App Router
│   ├── layout.tsx    # Auth routing logic
│   ├── init.ts       # App initialization
│   ├── client/       # Auto-generated OpenAPI client
│   └── [pages]/      # login, signup, verify-signup, dashboard
├── components/       # React components
│   ├── auth/        # auth-layout, auth-card, auth-input, auth-button, code-input
│   └── ui/          # shadcn/ui components
├── config/          # App constants & API setup
│   ├── app.ts       # APP_NAME, etc.
│   └── api.ts       # OpenAPI client init
├── contexts/        # React Context (user-context)
├── lib/             # Utilities (organized by PURPOSE)
│   ├── auth.ts      # isLoggedIn
│   ├── token.ts     # getToken, saveToken, clearToken (auto-syncs OpenAPI.TOKEN)
│   ├── error.ts     # handleError, handleApiError
│   ├── format.ts    # formatDate, getInitials, isValidUUID
│   ├── validation.ts # isValidEmail, isValidPassword, isValidFullName
│   └── utils.ts     # cn (Tailwind)
├── constants/       # Design tokens (ui.ts)
└── hooks/          # Custom React hooks
```

### File Organization Rules

**lib/** - Pure functions by PURPOSE:

- ✅ Single responsibility per file
- ✅ No React hooks (→ hooks/)
- ✅ No components (→ components/)
- ✅ No config (→ config/)
- ❌ No mixing concerns

**Token Management:**

```typescript
// lib/token.ts auto-syncs with OpenAPI.TOKEN
saveToken(token); // Stores + updates OpenAPI.TOKEN
clearToken(); // Removes + clears OpenAPI.TOKEN
```

**Error Handling:**

```typescript
// lib/error.ts - Centralized error handling
import { handleError } from "@/lib/error";

try {
  await UsersService.login({ requestBody: { email, password } });
} catch (error) {
  handleError(error);  // Handles all error types automatically
}

// Error handling logic:
// - 401/403: Clear token + redirect to /login
// - 429: Show rate limit message
// - Other: Show error from API response
```

### Authentication Flow

**Routes (`app/layout.tsx`):**

1. Guest routes (`/login`, `/signup`) → redirect to dashboard if logged in
2. Authenticated routes (`/dashboard`, `/settings`) → require login
3. Public routes → accessible to all

**Dependencies:**

- `CurrentUserDep` - Requires verified users
- `CurrentUserAllowUnverifiedDep` - Allows unverified (for `/user/me`, `/verify-signup`)

**Components (`components/auth/`):**

- `auth-layout.tsx` - Centered layout
- `auth-card.tsx` - Form container
- `auth-input.tsx` - Input with error handling + password toggle
- `auth-button.tsx` - Submit button with loading
- `code-input.tsx` - 6-digit verification (auto-focus, paste, auto-submit)

## Backend Architecture

```
backend/
├── core/
│   ├── config.py        # Settings (all env vars REQUIRED, no defaults)
│   ├── env.py          # get_env(), get_env_bool(), get_env_int()
│   ├── database.py     # DB connection
│   ├── exceptions.py   # Base AppException
│   ├── password.py     # Password hashing
│   ├── token.py        # Token generation
│   ├── auth.py         # JWT authentication (create_access_token, get_user_id_from_token)
│   ├── rate_limit.py   # Rate limiting (RateLimits, get_identifier)
│   ├── email.py        # Email service (SendGrid integration)
│   ├── logging.py      # Logging configuration
│   ├── middleware.py   # Custom middleware setup
│   └── validation.py   # Input validation utilities
├── api/deps.py         # SessionDep, CurrentUserDep, CurrentUserAllowUnverifiedDep, CurrentAdminDep
├── models.py           # SQLModel tables
└── modules/
    ├── registry.py     # Module registration
    └── {module}/
        ├── api.py      # FastAPI endpoints
        ├── db.py       # Database operations
        ├── {module}.py # Business logic
        ├── exceptions.py # Module-specific exceptions
        ├── background.py # Background tasks (optional)
        └── email.py    # Module-specific email templates (optional)
```

### Layered Architecture

```
API Layer (api.py)       → HTTP, validation, session.commit()
    ↓
Service Layer (*.py)     → Business logic, session.flush()
    ↓
DB Layer (db.py)         → CRUD, session.add() + session.flush()
    ↓
Model Layer (models.py)  → SQLModel tables
```

## Critical Rules

### Python File Standards

**1. Docstrings (MANDATORY):**

```python
"""
First line: Brief description.
Second line: Extended description.
"""
```

**2. Code Formatting (MANDATORY after ANY change):**

```bash
./venv/bin/isort backend/ --profile black
./venv/bin/black backend/
```

**3. Import Order:**

```python
# Standard library
import os
from datetime import datetime

# Third-party
from fastapi import APIRouter
from sqlmodel import Session

# Local
from backend.core.config import settings
from backend.models import User
```

### Session Management (CRITICAL)

**One session per request, one commit per request**

```python
# DB Layer (db.py) - ONLY flush, NEVER commit
def create(self, session: Session, **kwargs) -> User:
    user = User(**kwargs)
    session.add(user)
    session.flush()  # ✓
    return user

# Service Layer (*.py) - ONLY flush, NEVER commit
def verify_signup(self, session: Session, user_id: UUID, token: str) -> User:
    user = user_db.get_by_id(session, user_id)
    # ... business logic ...
    user = user_db.update(session, user_id, {"signup_verified": datetime.now()})
    # ✓ NO commit - let API layer handle it
    return user

# API Layer (api.py) - ONLY place for commit
@router.post("/signup")
def signup(data: SignupRequest, session: SessionDep):
    user = user_service.create_user(session, ...)
    # ... background tasks, token generation ...

    # Commit
    session.commit()  # ✓ Only here, at the END

    return response
```

**Benefits:**

- Clear transaction boundaries
- Atomic operations (all or nothing)
- Composable services
- Better error handling (auto-rollback)

### Timezone Configuration

**System timezone set to UTC in `main.py`:**

```python
os.environ["TZ"] = "UTC"
time.tzset()
```

**DateTime Usage:**

```python
# ✓ CORRECT
from datetime import datetime
created_at = datetime.now()  # Returns UTC automatically

# ✗ WRONG
created_at = datetime.now(timezone.utc)  # Unnecessary
```

**Models:**

```python
class BaseModel(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
```

### Exception Handling

**1. Module-specific exceptions (`backend/modules/{module}/exceptions.py`):**

```python
from backend.core.exceptions import AppException

class UserNotFound(AppException):
    MESSAGE = "User not found"

    def __init__(self, user_id: str | None = None):
        message = f"User with ID '{user_id}' not found" if user_id else self.MESSAGE
        super().__init__(message, status_code=404)
```

**2. Global handler (`main.py`):**

```python
@app.exception_handler(AppException)
async def app_exception_handler(req: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
```

**3. Usage (no try-except needed):**

```python
# Service layer
def authenticate(self, session: Session, email: str, password: str) -> User:
    user = user_db.get_by_email(session, email)
    if not user:
        raise InvalidCredentials()  # Global handler catches it
    return user

# API layer
@router.post("/login")
def login(data: LoginRequest, session: SessionDep):
    user = user_service.authenticate(session, data.email, data.password)
    # No try-except needed
    return response
```

**Exception Patterns:**

- ✅ Create `{module}/exceptions.py` per module
- ✅ Define `MESSAGE` class constant
- ✅ Use descriptive names (`UserNotFound`, not `NotFound`)
- ✅ Include optional context params
- ✅ Raise directly, no try-except (unless specific handling needed)

### Rate Limiting

**Implementation: fastapi-limiter with Redis**

Rate limiting protects endpoints from abuse using Redis-backed counters that work across multiple instances.

**Configuration (`backend/core/rate_limit.py`):**

```python
from fastapi_limiter.depends import RateLimiter

class RateLimits:
    """Standard rate limit configurations."""

    # Authentication endpoints - 2 attempts per 24 hours
    AUTH = RateLimiter(times=2, hours=24, identifier=get_identifier)

    # Resend operations - 1 attempt per 5 minutes
    RESEND = RateLimiter(times=1, minutes=5, identifier=get_identifier)
```

**Identifier Function:**

```python
async def get_identifier(request: Request) -> str:
    """
    Get identifier for rate limiting.

    Uses user ID if authenticated (from JWT token), otherwise falls back to IP address.
    This ensures authenticated users have per-user limits while unauthenticated
    requests are limited by IP.
    """
    # Try to get user ID from JWT token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            user_id = get_user_id_from_token(token)
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass

    # Fallback to IP address
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
```

**Usage:**

```python
from fastapi import Depends
from backend.core.rate_limit import RateLimits

@router.post("/login", dependencies=[Depends(RateLimits.AUTH)])
def login(data: LoginRequest, session: SessionDep):
    """Login user - rate limited to 2 attempts per 24 hours."""
    ...

@router.post("/resend-verification", dependencies=[Depends(RateLimits.RESEND)])
def resend_verification(current_user: CurrentUserAllowUnverifiedDep):
    """Resend email - rate limited to 1 attempt per 5 minutes."""
    ...
```

**Initialization (`main.py`):**

```python
from contextlib import asynccontextmanager
from backend.core.rate_limit import init_rate_limiter, close_rate_limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_rate_limiter()
    yield
    # Shutdown
    await close_rate_limiter()

app = FastAPI(lifespan=lifespan)
```

**Environment Setup:**

```bash
# .env (local development - Docker)
REDIS_URL=redis://localhost:6379/0

# Azure Web App Configuration
REDIS_URL=redis://your-cache.redis.cache.windows.net:6380/0?ssl=True
```

**Local Development:**

```bash
# Start Redis with Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or use Docker Compose
docker-compose up -d redis
```

**Azure Deployment:**

1. Create Azure Cache for Redis (Basic tier ~$16/month)
2. Add `REDIS_URL` to Azure Web App configuration
3. Rate limiting works automatically across all instances

**Benefits:**

- ✅ Prevents brute-force attacks (login, signup)
- ✅ Stops email spam (resend verification)
- ✅ Protects against DoS
- ✅ Works across multiple instances (Redis-backed)
- ✅ Per-endpoint customization
- ✅ Returns HTTP 429 (Too Many Requests) when exceeded

**Identifier Strategy:**

- ✅ **Authenticated requests**: Rate limited by user ID (from JWT token)
  - Each user has independent limits
  - Users behind same IP don't affect each other
  - Can't bypass by switching IPs (tied to account)
- ✅ **Unauthenticated requests**: Rate limited by IP address
  - Prevents brute-force from same IP
  - Works for login, signup, verify-signup
  - Respects `X-Forwarded-For` header (proxies/load balancers)

**Best Practices:**

- Use `AUTH` for authentication endpoints (login, signup, verify-signup)
- Use `RESEND` for email/notification triggers
- Add more rate limit categories as needed for your endpoints
- Adjust times/periods based on your security requirements

### FastAPI Dependencies

```python
from backend.api.deps import (
    SessionDep,                      # Database session
    CurrentUserDep,                  # Verified user only
    CurrentUserAllowUnverifiedDep,   # Verified OR unverified
    CurrentAdminDep                  # Admin only (verified + is_admin=True)
)

# Usage
@router.get("/me")
def get_me(current_user: CurrentUserAllowUnverifiedDep):
    return UserPublic.model_validate(current_user)

@router.get("/profile")
def get_profile(current_user: CurrentUserDep, session: SessionDep):
    # User must be verified
    return response

# Admin - Method 1: Need user object
@router.get("/admin/users")
def list_users(current_admin: CurrentAdminDep, session: SessionDep):
    # Can access current_admin.id, etc.
    return users

# Admin - Method 2: Don't need user object
@router.get("/health", dependencies=[Depends(get_current_admin)])
def check():
    return {"status": "healthy"}
```

### OpenAPI Naming Best Practices

**CRITICAL:** Keep OpenAPI generated client methods clean by following simple naming conventions.

#### Core Principle

**The URL path provides context - don't repeat it in function names**

The module name is already in the URL prefix (defined in `registry.py`), and tags are applied when routers are included. Function names should be short and action-focused.

#### Rules

**1. Function Names: Action Only**

```python
# ✅ CORRECT - Simple action names
@router.post("/login")
def login(data: LoginRequest):
    pass
# Generated: UsersService.login()

@router.get("/me")
def get_me(current_user: CurrentUserDep):
    pass
# Generated: UsersService.getMe()

# ❌ WRONG - Repeating context
@router.post("/login")
def user_login_endpoint(data: LoginRequest):
    pass
# Generated: UsersService.userLoginEndpoint() - redundant!
```

**2. Tags Defined in Registry**

```python
# backend/modules/registry.py
MODULES = [
    ModuleConfig(
        name="user",
        router=lambda: __import__("backend.modules.user.api", fromlist=["router"]).router,
        prefix="/user",
        tags=["Users"],  # ← Tags applied here
    ),
]

# backend/modules/user/api.py
router = APIRouter()  # ← No tags needed, registry applies them
```

**3. RESTful Naming Patterns**

```python
# Users module (/api/v1/user)
@router.post("/signup")
def signup(data: SignupRequest):
    """Sign up a new user."""
    # UsersService.signup()

@router.post("/login")
def login(data: LoginRequest):
    """Login user."""
    # UsersService.login()

@router.get("/me")
def get_me(current_user: CurrentUserDep):
    """Get current user profile."""
    # UsersService.getMe()

@router.put("/{user_id}")
def update(user_id: UUID, data: UpdateUserRequest):
    """Update user."""
    # UsersService.update()

@router.delete("/{user_id}")
def delete(user_id: UUID):
    """Delete user."""
    # UsersService.delete()

@router.post("/{user_id}/change-password")
def change_password(user_id: UUID, data: ChangePasswordRequest):
    """Change user password."""
    # UsersService.changePassword()
```

**4. Response Model Naming**

**Don't add "Response" suffix** - the context is already clear from `response_model=`

```python
# ✅ CORRECT - Clean names
class Auth(BaseModel):
    """Authentication response with token and user data."""
    access_token: str
    user: UserPublic

class Message(BaseModel):
    """Simple message response."""
    message: str

@router.post("/login", response_model=Auth)
def login(data: LoginRequest):
    return Auth(access_token=token, user=user)

# ❌ WRONG - Redundant suffix
class AuthResponse(BaseModel):  # "Response" is redundant
    access_token: str
    user: UserPublic

@router.post("/login", response_model=AuthResponse)  # Already says it's a response
def login(data: LoginRequest):
    return AuthResponse(access_token=token, user=user)
```

**5. Naming Pattern Table**

| HTTP Method | Pattern | Example Function | Generated Client |
|-------------|---------|------------------|------------------|
| GET (list) | `list` or `get_all` | `list()` | `UsersService.list()` |
| GET (single) | `get` or `get_{resource}` | `get_me()` | `UsersService.getMe()` |
| POST (create) | action verb | `signup()`, `login()` | `UsersService.signup()` |
| PUT/PATCH | `update` | `update()` | `UsersService.update()` |
| DELETE | `delete` | `delete()` | `UsersService.delete()` |
| POST (action) | `{action}` | `verify_signup()` | `UsersService.verifySignup()` |

#### Complete Module Example

```python
# backend/modules/user/api.py
from fastapi import APIRouter

router = APIRouter()  # Tags applied in registry.py

# Response models - no "Response" suffix
class Auth(BaseModel):
    """Authentication response with token and user data."""
    access_token: str
    user: UserPublic

class Message(BaseModel):
    """Simple message response."""
    message: str

# Endpoints with clean names
@router.post("/signup", response_model=Auth)
def signup(data: SignupRequest, session: SessionDep, background_tasks: BackgroundTasks):
    """Sign up a new user and send verification email."""
    # Client: UsersService.signup()
    pass

@router.post("/verify-signup", response_model=UserPublic)
def verify_signup(data: VerifySignupRequest, session: SessionDep):
    """Verify user signup with 6-digit verification code."""
    # Client: UsersService.verifySignup()
    pass

@router.post("/login", response_model=Auth)
def login(data: LoginRequest, session: SessionDep):
    """Login user with email and password."""
    # Client: UsersService.login()
    pass

@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUserAllowUnverifiedDep):
    """Get current authenticated user profile."""
    # Client: UsersService.getMe()
    pass

@router.put("/{user_id}", response_model=UserPublic)
def update(user_id: UUID, data: UpdateUserRequest, session: SessionDep):
    """Update user data."""
    # Client: UsersService.update()
    pass

@router.delete("/{user_id}", response_model=Message)
def delete(user_id: UUID, session: SessionDep):
    """Delete a user."""
    # Client: UsersService.delete()
    pass
```

#### Summary

**DO:**
- ✅ Use simple, action-focused function names
- ✅ Remove "Response" suffix from response models
- ✅ Let URL path and tags provide context
- ✅ Follow RESTful patterns (`list`, `get`, `update`, `delete`)
- ✅ Use action verbs for operations (`login`, `signup`, `verify_signup`)
- ✅ Define tags in `registry.py`, not in individual routers

**DON'T:**
- ❌ Include "api", "v1", "endpoint", or module name in function names
- ❌ Add "Response" suffix to response models (use `Auth` not `AuthResponse`)
- ❌ Repeat path information in function names
- ❌ Use long names like `get_user_by_id_endpoint`
- ❌ Add tags to individual routers (they're in registry)

**Result: Clean, readable OpenAPI client:**

```typescript
// Clean, maintainable client methods
const response = await UsersService.login({ requestBody: { email, password } });
const user = await UsersService.getMe();
await UsersService.verifySignup({ requestBody: { user_id, signup_token } });
await UsersService.update({ userId, requestBody: { full_name } });
```

### Service and Repository Naming Conventions

**CRITICAL:** Class context provides scope - don't repeat resource names in method names.

#### Core Principle

**The class name (UserService, UserDB) already tells you it's about users - don't repeat "user" in every method**

#### Repository Layer (DB)

```python
class UserDB:
    """Repository for user database operations."""

    # ✅ CORRECT - No "user" prefix
    def get_by_id(self, session: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return session.get(User, user_id)

    def get_by_email(self, session: Session, email: str) -> Optional[User]:
        """Get user by email address."""
        query = select(User).where(User.email == email)
        return session.exec(query).first()

    def create(self, session: Session, **kwargs) -> User:
        """Create a new user."""
        user = User(**kwargs)
        session.add(user)
        session.flush()  # Never commit in DB layer
        return user

    def update(self, session: Session, user_id: UUID, user_data: dict) -> Optional[User]:
        """Update user by ID."""
        user = self.get_by_id(session, user_id)
        if not user:
            return None
        for key, value in user_data.items():
            setattr(user, key, value)
        # Update timestamp
        user.updated_at = datetime.now()
        session.flush()  # Never commit in DB layer
        return user

    def delete(self, session: Session, user_id: UUID) -> bool:
        """Delete user by ID."""
        user = self.get_by_id(session, user_id)
        if not user:
            return False
        session.delete(user)
        session.flush()  # Never commit in DB layer
        return True

    def exists_by_email(self, session: Session, email: str) -> bool:
        """Check if user exists by email."""
        query = select(User.id).where(User.email == email)
        return session.exec(query).first() is not None

# ❌ WRONG - Redundant "user" prefix
class UserDB:
    def get_user_by_id(...)     # ← Already in "UserDB"
    def create_user(...)        # ← Already in "UserDB"
    def update_user(...)        # ← Already in "UserDB"
```

#### Service Layer

```python
class UserService:
    """Service class for user business logic."""

    # ✅ CORRECT - CRUD methods without "user" suffix
    def get(self, session: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return user_db.get_by_id(session, user_id)

    def get_by_email(self, session: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return user_db.get_by_email(session, email)

    def create(self, session: Session, email: str, password: str, full_name: str) -> User:
        """Create a new user with signup verification."""
        if user_db.exists_by_email(session, email):
            raise EmailAlreadyExists(email)
        # ... business logic ...
        return user_db.create(session, ...)

    def create_oauth(self, session: Session, email: str, full_name: str, auth_provider: str) -> User:
        """Create a user from OAuth provider."""
        # ... business logic ...
        return user_db.create(session, ...)

    def update(self, session: Session, user_id: UUID, **kwargs) -> Optional[User]:
        """Update user data."""
        # ... business logic ...
        return user_db.update(session, user_id, kwargs)

    def delete(self, session: Session, user_id: UUID) -> bool:
        """Delete a user."""
        return user_db.delete(session, user_id)

    def exists_by_email(self, session: Session, email: str) -> bool:
        """Check if a user exists by email."""
        return user_db.exists_by_email(session, email)

    # ✅ CORRECT - Action methods use verbs
    def authenticate(self, session: Session, email: str, password: str) -> User:
        """Authenticate user with email and password."""
        # ... business logic ...

    def verify_password(self, user: User, password: str) -> bool:
        """Verify user password."""
        # ... business logic ...

    def change_password(self, session: Session, user_id: UUID, old_password: str, new_password: str) -> User:
        """Change user password."""
        # ... business logic ...

    def verify_signup(self, session: Session, user_id: UUID, signup_token: str) -> User:
        """Verify user signup with verification code."""
        # ... business logic ...

# Global singleton instance
user_service = UserService()
```

#### Usage Examples

**Clean service calls:**
```python
# API layer using service
@router.post("/signup", response_model=Auth)
def signup(data: SignupRequest, session: SessionDep):
    # Clean - no redundant "user" in method names
    user = user_service.create(session, data.email, data.password, data.full_name)
    return Auth(access_token=token, user=UserPublic.model_validate(user))

@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUserDep):
    return UserPublic.model_validate(current_user)

@router.put("/{user_id}", response_model=UserPublic)
def update(user_id: UUID, data: UpdateUserRequest, session: SessionDep):
    user = user_service.update(session, user_id, **data.model_dump(exclude_unset=True))
    if not user:
        raise UserNotFound(str(user_id))
    session.commit()
    return UserPublic.model_validate(user)
```

#### Naming Rules Summary

**Repository (DB Layer):**
| Pattern | Method Name | NOT This |
|---------|-------------|----------|
| Get by ID | `get_by_id()` | ❌ `get_user_by_id()` |
| Get by field | `get_by_email()` | ❌ `get_user_by_email()` |
| Create | `create()` | ❌ `create_user()` |
| Update | `update()` | ❌ `update_user()` |
| Delete | `delete()` | ❌ `delete_user()` |
| Exists | `exists_by_email()` | ❌ `user_exists_by_email()` |

**Service Layer:**
| Pattern | Method Name | NOT This |
|---------|-------------|----------|
| Get by ID | `get()` | ❌ `get_user()` |
| Get by field | `get_by_email()` | ❌ `get_user_by_email()` |
| Create | `create()` | ❌ `create_user()` |
| Create variant | `create_oauth()` | ❌ `create_oauth_user()` |
| Update | `update()` | ❌ `update_user()` |
| Delete | `delete()` | ❌ `delete_user()` |
| Action verb | `authenticate()` | ✅ Good |
| Action verb | `verify_password()` | ✅ Good |
| Action verb | `change_password()` | ✅ Good |

**Benefits:**
- ✅ Cleaner, more readable code
- ✅ Less typing, less redundancy
- ✅ Class context makes it obvious what resource you're working with
- ✅ Consistent with RESTful principles

### Environment Variables

**All variables REQUIRED (no defaults) via `backend/core/env.py`:**

```python
from backend.core.env import get_env, get_env_bool, get_env_int

APP_NAME = get_env("APP_NAME")           # Required string
DEBUG = get_env_bool("DEBUG")            # true/false/yes/no/1/0
PORT = get_env_int("PORT")               # Integer
REDIS_URL = get_env("REDIS_URL")         # Redis connection string

# Access via settings
from backend.core.config import settings
app_name = settings.APP_NAME
db_uri = settings.database_uri
redis_url = settings.REDIS_URL
```

**Required Variables:**

```bash
# Application
APP_NAME=Sample
APP_VERSION=1.0.0
APP_PUBLIC_URL=http://localhost:3000
ENABLE_USER_EMAILS=true

# API
API_PREFIX=/api/v1

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
CORS_ALLOW_HEADERS=*
CORS_ALLOW_METHODS=*
CORS_ALLOW_CREDENTIALS=true

# JWT
JWT_ALGORITHM=HS256
JWT_SECRET_KEY=your-secret-key-here
JWT_EXPIRE_MINUTES_DELTA=43200

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@example.com
SENDGRID_VERIFY_SSL=true

# PostgreSQL
POSTGRES_DB=sample_db
POSTGRES_USER=postgres
POSTGRES_PORT=5432
POSTGRES_SERVER=localhost
POSTGRES_PASSWORD=your-password

# Redis (for rate limiting)
REDIS_URL=redis://localhost:6379/0
```

**Deployment:**

- Local: `.env` file loaded via `python-dotenv`
- Production: Azure Web App configuration
- Validation: Fails fast at startup if missing

### Database Guidelines

**Models:**

```python
class User(BaseModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    # ...
```

**Migrations:**

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply
alembic upgrade head

# Rollback
alembic downgrade -1
```

**Repository Pattern:**

```python
class UserDB:
    def get_by_email(self, session: Session, email: str) -> Optional[User]:
        return session.exec(select(User).where(User.email == email)).first()

    def create(self, session: Session, **kwargs) -> User:
        user = User(**kwargs)
        session.add(user)
        session.flush()  # ✓ Not commit
        return user
```

### Email Templates

**Location:** `backend/modules/user/email_templates/`

**Design Consistency (ALL templates):**

- Gradient header: `linear-gradient(135deg, #059fff 0%, #0589e6 100%)`
- Colors: `#1a1a1a` (text), `#4a5568` (body), `#64748b` (muted)
- Typography: Inter font (400, 500, 600)
- Border-radius: `12px` (containers), `8px` (elements)
- Shadow: `0 4px 6px rgba(0, 0, 0, 0.07)`

**Email Client Compatibility:**

- Table-based structure
- Inline styles with `!important` for critical elements (buttons)
- Mobile responsive (`@media max-width: 600px`)
- Width control to prevent overflow

**Templates:**

1. `signup_verify.html` - 6-digit verification code
2. `welcome.html` - Post-verification welcome

**Variables (Jinja2):**

```python
context = {
    "name": user.full_name,
    "email": user.email,
    "app_public_url": settings.APP_PUBLIC_URL,
    "project_name": settings.APP_NAME,
    "current_year": datetime.now().year,
    "verification_code": token,  # Template-specific
}
```

## Code Style

**Type Hints:**

```python
def get_user(session: Session, user_id: UUID) -> Optional[User]:
    return session.get(User, user_id)
```

**API Endpoints:**

```python
@router.post("/signup", response_model=AuthResponse)
def signup(user_data: SignupRequest, session: SessionDep):
    """Sign up a new user."""
    user = user_service.create_user(session, **user_data.model_dump())
    access_token = create_access_token(user.id)

    # Commit
    session.commit()

    return AuthResponse(access_token=access_token, user=UserPublic.model_validate(user))
```

**Pydantic Models:**

```python
class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str

    @field_validator("email")
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        if not is_valid_email(v):
            raise InvalidEmailFormat()
        return normalize_email(v)
```

## Performance

**N+1 Prevention:**

```python
# Good - Eager loading
from sqlalchemy.orm import selectinload
statement = select(User).options(selectinload(User.organizations))
users = session.exec(statement).all()
```

**Pagination:**

```python
def get_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return session.exec(select(User).offset(skip).limit(limit)).all()
```

## NEVER FORGET

### Code Standards

1. ✅ Two-line docstrings on ALL Python files
2. ✅ Run `isort` + `black` after ANY change
3. ❌ Never modify `data-engineering/`, `web-app/`, `testing/`
4. ✅ Type hints on all functions
5. ✅ Use `./venv/bin/python` for execution

### Architecture

6. ✅ Follow layered architecture (API → Service → DB → Model)
7. ✅ Use dependency injection (SessionDep, CurrentUserDep)
8. ✅ Write tests for new features

### Session Management (CRITICAL)

9. ❌ DB Layer: NEVER `session.commit()`, only `session.flush()`
10. ❌ Service Layer: NEVER `session.commit()`, only `session.flush()`
11. ✅ API Layer: ONLY place for `session.commit()` (at END with `# Commit` comment)
12. ✅ One session per request, one commit per request

### Timezone & DateTime

13. ✅ Use `datetime.now()` (system timezone is UTC)
14. ❌ Never `datetime.now(timezone.utc)` (redundant)
15. ✅ PostgreSQL configured with UTC timezone

### Security

16. ❌ Never store plain passwords (hash with `password_manager`)
17. ✅ Clear tokens after use (`user.signup_token = None`)
18. ✅ All env vars REQUIRED (no defaults)
19. ✅ Use `backend.core.env` functions (`get_env`, `get_env_bool`, `get_env_int`)
20. ✅ Apply rate limits to all endpoints (especially auth endpoints)

### Error Handling

21. ✅ Raise `AppException` subclasses for business errors
22. ❌ Never wrap `AppException` in try-except in API layer (global handler catches)
23. ✅ Include proper HTTP status codes in exceptions
24. ✅ Frontend handles 429 errors with user-friendly messages

### Rate Limiting

25. ✅ Use `Depends(RateLimits.AUTH)` for authentication endpoints
26. ✅ Use `Depends(RateLimits.RESEND)` for email/notification triggers
27. ✅ Rate limits use user ID if authenticated, IP if not
28. ✅ Redis required for production (Azure Cache for Redis)

### Naming

29. ✅ Use `APP_VERSION`, `APP_NAME` (not `VERSION`, `PROJECT_NAME`)
30. ✅ Remove "Response" suffix from response models (Auth not AuthResponse)
31. ✅ Keep "Request" suffix for request models (SignupRequest)
32. ✅ Service/DB methods: clean names without resource prefix (get not get_user)

## Quick Reference

```bash
# Format code (AFTER EVERY CHANGE)
./venv/bin/isort backend/ --profile black && ./venv/bin/black backend/

# Run app
./venv/bin/python -m uvicorn main:app --reload

# Start Redis (required for rate limiting)
docker run -d --name redis -p 6379:6379 redis:alpine

# Migrations
alembic upgrade head
alembic revision --autogenerate -m "Description"

# Dependencies
./venv/bin/pip install -r requirements.txt

# Tests
./venv/bin/pytest

# Check config
./venv/bin/python -c "from backend.core.config import settings; print('✓ Config OK')"

# Stop Redis
docker stop redis && docker rm redis
```

## Git Workflow

**Branch naming:**

```
feature/user-authentication
fix/signup-validation
refactor/database-layer
docs/api-documentation
```

**Pre-commit:**

```bash
./venv/bin/isort backend/ --profile black
./venv/bin/black backend/
pytest
```

## Debugging

**Breakpoints:**

```python
import pdb; pdb.set_trace()
```

**SQL logging:**

```python
SQLALCHEMY_ECHO = True  # In config
```

**Request logging:**
Automatic via middleware (45.23ms timing)

## API Documentation

Auto-generated:

- `/docs` - Swagger UI
- `/redoc` - ReDoc

---

**Source of truth for all Sample development. Maintain these standards for consistency, maintainability, and scalability.**
