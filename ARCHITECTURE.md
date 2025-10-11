# Backend Architecture Rules

## Layered Architecture

```
API Layer (api.py)       → HTTP, validation, orchestration, session.commit()
    ↓
Service Layer (*.py)     → Business logic, exceptions, session.flush()
    ↓
DB Layer (db.py)         → CRUD operations, session.add() + session.flush()
    ↓
Model Layer (models.py)  → SQLModel tables
```

---

## Layer Responsibilities

### 1. DB Layer (`db.py`)

**Purpose:** Dumb CRUD operations. No business logic, no exceptions.

**Rules:**
- ✅ Simple database operations only
- ✅ Always `session.flush()`, NEVER `session.commit()`
- ✅ Work with fetched objects when possible
- ❌ No business logic
- ❌ No exceptions (except database errors)
- ❌ No validation

**Pattern:**

```python
class UserDB:
    """Repository for user database operations."""

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
        session.flush()  # ✓ Only flush
        return user

    def update(self, session: Session, user: User, user_data: dict) -> User:
        """Update existing user object (no re-query)."""
        for key, value in user_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.now()
        session.flush()  # ✓ Only flush
        return user

    def delete(self, session: Session, user: User) -> None:
        """Delete existing user object (no re-query)."""
        session.delete(user)
        session.flush()  # ✓ Only flush

    def exists_by_email(self, session: Session, email: str) -> bool:
        """Check if user exists by email."""
        query = select(User.id).where(User.email == email)
        return session.exec(query).first() is not None

# Global instance
user_db = UserDB()
```

**Key Points:**
- Methods like `update()` and `delete()` take **User object**, not `user_id` (avoids redundant queries)
- Return types: `User`, `Optional[User]`, `List[User]`, `bool`, `None`
- Never check business rules

---

### 2. Service Layer (`*.py`)

**Purpose:** Business logic, validation, exception handling. Single source of truth for business rules.

**Rules:**
- ✅ All business logic lives here
- ✅ Raise exceptions for error cases
- ✅ Always `session.flush()`, NEVER `session.commit()`
- ✅ Work with fetched DB objects to avoid re-queries
- ✅ Query once, validate, then modify object directly
- ❌ No HTTP concerns (status codes handled by exceptions)
- ❌ No session.commit() (API layer responsibility)

**Pattern:**

```python
class UserService:
    """Service class for user business logic."""

    def get(self, session: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return user_db.get_by_id(session, user_id)

    def get_by_email(self, session: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return user_db.get_by_email(session, email)

    def create(self, session: Session, email: str, password: str, full_name: str) -> User:
        """Create a new user with signup verification."""
        # Business rule: email must be unique
        if user_db.exists_by_email(session, email):
            raise EmailAlreadyExists(email)

        # Business logic: hash password, generate token
        hashed_password = password_manager.get_hash(password)
        signup_token = token_manager.generate_signup_token()

        user = user_db.create(
            session,
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            signup_verified=None,
            signup_token=signup_token,
        )

        return user

    def update(self, session: Session, user_id: UUID, **kwargs) -> User:
        """Update user data."""
        # Query once
        user = user_db.get_by_id(session, user_id)
        if not user:
            raise UserNotFound(str(user_id))

        # Business logic: handle password hashing
        if "password" in kwargs:
            kwargs["hashed_password"] = password_manager.get_hash(kwargs.pop("password"))

        # Update using fetched object (no re-query)
        return user_db.update(session, user, kwargs)

    def delete(self, session: Session, user_id: UUID) -> None:
        """Delete a user."""
        # Query once
        user = user_db.get_by_id(session, user_id)
        if not user:
            raise UserNotFound(str(user_id))

        # Delete using fetched object (no re-query)
        user_db.delete(session, user)

    def authenticate(self, session: Session, email: str, password: str) -> User:
        """Authenticate user with email and password."""
        user = user_db.get_by_email(session, email)
        if not user:
            raise InvalidCredentials()
        if not password_manager.verify(password, user.hashed_password):
            raise InvalidCredentials()

        return user

    def change_password(
        self, session: Session, user_id: UUID, old_password: str, new_password: str
    ) -> User:
        """Change user password after verifying old password."""
        # Query once
        user = user_db.get_by_id(session, user_id)
        if not user:
            raise UserNotFound(str(user_id))

        # Business rule: verify old password
        if not password_manager.verify(old_password, user.hashed_password):
            raise InvalidPasswordChange()

        # Update directly on fetched object (no re-query)
        user.hashed_password = password_manager.get_hash(new_password)
        user.updated_at = datetime.now()
        session.flush()

        return user

    def verify_signup(self, session: Session, user_id: UUID, signup_token: str) -> User:
        """Verify user signup with 6-digit verification code."""
        # Query once
        user = user_db.get_by_id(session, user_id)
        if not user:
            raise UserNotFound(str(user_id))

        # Business rules
        if user.signup_verified:
            raise UserAlreadyVerified()
        if user.signup_token != signup_token:
            raise InvalidVerificationCode()

        # Update directly on fetched object (no re-query)
        user.signup_token = None
        user.signup_verified = datetime.now()
        user.updated_at = datetime.now()
        session.flush()

        return user

# Global instance
user_service = UserService()
```

**Key Points:**
- **Query once** at the start of the method
- **Validate** business rules
- **Modify** the fetched object directly (avoid re-query in `update()`/`delete()`)
- **Always raise exceptions** for error cases (never return `None` for operations that should always succeed)
- Simple getters can return `Optional[User]`, but operations should raise exceptions

---

### 3. API Layer (`api.py`)

**Purpose:** HTTP interface, request/response handling, orchestration, transaction management.

**Rules:**
- ✅ Handle HTTP requests/responses
- ✅ Validate input (Pydantic models)
- ✅ Orchestrate multiple services
- ✅ Manage background tasks
- ✅ **ONLY place for `session.commit()`** (at the END)
- ✅ Let exceptions bubble up (global handler catches them)
- ❌ No business logic
- ❌ No database queries (use service layer)
- ❌ No redundant `if not` checks (service raises exceptions)

**Pattern:**

```python
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel, field_validator

from backend.api.deps import SessionDep, CurrentUserDep
from backend.core.rate_limit import RateLimits
from backend.models import UserPublic

from .user import user_service

router = APIRouter()


# Request models
class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str

    @field_validator("email")
    @classmethod
    def validate_email_field(cls, v: str) -> str:
        """Validate email format."""
        if not is_valid_email(v):
            raise InvalidEmailFormat()
        return normalize_email(v)


# Response models
class Message(BaseModel):
    """Simple message response."""
    message: str


class Auth(BaseModel):
    """Authentication response with token and user data."""
    access_token: str
    user: UserPublic


@router.post("/signup", response_model=Auth, dependencies=[Depends(RateLimits.AUTH)])
def signup(
    user_data: SignupRequest,
    session: SessionDep,
    background_tasks: BackgroundTasks,
):
    """Sign up a new user and send verification email."""
    # Service handles business logic and exceptions
    user = user_service.create(
        session,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
    )

    # Background task
    background_tasks.add_task(
        send_verification_email_task,
        email=user.email,
        name=user.full_name,
        token=user.signup_token,
    )

    # Generate token
    access_token = create_access_token(user.id)

    # Commit (ONLY place for commit)
    session.commit()

    return Auth(access_token=access_token, user=UserPublic.model_validate(user))


@router.put("/", response_model=UserPublic)
def update(
    current_user: CurrentUserDep,
    user_data: UpdateUserRequest,
    session: SessionDep,
):
    """Update current user's data."""
    # Service raises UserNotFound if not found (no need to check here)
    user = user_service.update(
        session, current_user.id, **user_data.model_dump(exclude_unset=True)
    )

    # Commit
    session.commit()

    return UserPublic.model_validate(user)


@router.delete("/", response_model=Message)
def delete(current_user: CurrentUserDep, session: SessionDep):
    """Delete current user's account."""
    # Service raises UserNotFound if not found (no need to check here)
    user_service.delete(session, current_user.id)

    # Commit
    session.commit()

    return Message(message="User deleted successfully")


@router.post("/change-password", response_model=Message)
def change_password(
    current_user: CurrentUserDep,
    password_data: ChangePasswordRequest,
    session: SessionDep,
):
    """Change current user's password."""
    # Service handles all validation and raises exceptions
    user_service.change_password(
        session,
        current_user.id,
        password_data.old_password,
        password_data.new_password,
    )

    # Commit
    session.commit()

    return Message(message="Password changed successfully")
```

**Key Points:**
- **No `if not user:` checks** - service layer raises exceptions
- **Only one `session.commit()`** per endpoint (at the END)
- **Clean orchestration** - call services, manage background tasks, commit
- Let exceptions bubble up - global handler returns proper HTTP responses

---

## Exception Handling

### Module-Specific Exceptions (`{module}/exceptions.py`)

```python
from backend.core.exceptions import AppException


class UserNotFound(AppException):
    """Raised when user is not found."""
    MESSAGE = "User not found"

    def __init__(self, user_id: str | None = None):
        message = f"User with ID '{user_id}' not found" if user_id else self.MESSAGE
        super().__init__(message, status_code=404)


class EmailAlreadyExists(AppException):
    """Raised when email is already registered."""
    MESSAGE = "Email already registered"

    def __init__(self, email: str | None = None):
        message = f"Email '{email}' is already registered" if email else self.MESSAGE
        super().__init__(message, status_code=400)


class InvalidCredentials(AppException):
    """Raised when login credentials are invalid."""
    MESSAGE = "Invalid email or password"

    def __init__(self):
        super().__init__(self.MESSAGE, status_code=401)
```

### Common Exceptions (`backend/core/exceptions.py`)

For exceptions used across multiple modules:

```python
class InvalidEmailFormat(AppException):
    """Raised when email format is invalid."""
    MESSAGE = "Invalid email address format"

    def __init__(self):
        super().__init__(self.MESSAGE, status_code=400)


class InvalidPasswordFormat(AppException):
    """Raised when password doesn't meet requirements."""
    MESSAGE = "Password must be at least 8 characters long"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.MESSAGE, status_code=400)
```

### Usage

**Service Layer (raise exceptions):**
```python
def update(self, session: Session, user_id: UUID, **kwargs) -> User:
    user = user_db.get_by_id(session, user_id)
    if not user:
        raise UserNotFound(str(user_id))  # ✓ Raise exception

    return user_db.update(session, user, kwargs)
```

**API Layer (let exceptions bubble up):**
```python
@router.put("/", response_model=UserPublic)
def update(current_user: CurrentUserDep, user_data: UpdateUserRequest, session: SessionDep):
    # No try-except needed - global handler catches exceptions
    user = user_service.update(session, current_user.id, **user_data.model_dump(exclude_unset=True))
    session.commit()
    return UserPublic.model_validate(user)
```

**Global Handler (automatic, in `main.py`):**
```python
@app.exception_handler(AppException)
async def app_exception_handler(req: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
```

---

## Session Management

### The Golden Rule

**One session per request, one commit per request.**

### Rules by Layer

| Layer | Allowed | Not Allowed |
|-------|---------|-------------|
| **DB Layer** | `session.add()`, `session.flush()` | ❌ `session.commit()` |
| **Service Layer** | `session.flush()` | ❌ `session.commit()` |
| **API Layer** | `session.commit()` (once, at END) | ❌ Multiple commits |

### Why This Pattern?

✅ **Clear transaction boundaries** - All changes commit or rollback together
✅ **Atomic operations** - All or nothing
✅ **Composable services** - Services can call each other safely
✅ **Better error handling** - Rollback happens automatically on exception

### Example: Bad (Old Pattern)

```python
# ❌ BAD: Multiple commits, unclear transaction boundaries

# DB Layer
def update(self, session: Session, user_id: UUID, user_data: dict) -> Optional[User]:
    user = self.get_by_id(session, user_id)  # Query 1
    if not user:
        return None
    for key, value in user_data.items():
        setattr(user, key, value)
    session.flush()
    return user

# Service Layer
def change_password(self, session: Session, user_id: UUID, old_pw: str, new_pw: str) -> User:
    user = user_db.get_by_id(session, user_id)  # Query 2 (redundant!)
    if not user:
        raise UserNotFound(str(user_id))

    hashed_password = password_manager.get_hash(new_pw)
    updated_user = user_db.update(session, user_id, {"hashed_password": hashed_password})  # Query 3!
    if not updated_user:
        raise UserNotFound(str(user_id))

    return updated_user

# API Layer
@router.post("/{user_id}/change-password", response_model=Message)
def change_password(user_id: UUID, password_data: ChangePasswordRequest, session: SessionDep):
    user_service.change_password(session, user_id, password_data.old_password, password_data.new_password)
    session.commit()
    return Message(message="Password changed successfully")
```

**Problems:**
- 3 database queries (get_by_id called twice + update calls it again)
- Inconsistent error handling (Optional vs exceptions)
- Redundant None checks in service layer

### Example: Good (New Pattern)

```python
# ✅ GOOD: Single query, consistent exceptions, clean separation

# DB Layer
def update(self, session: Session, user: User, user_data: dict) -> User:
    """Update existing user object."""
    for key, value in user_data.items():
        setattr(user, key, value)
    user.updated_at = datetime.now()
    session.flush()  # ✓ Only flush
    return user

# Service Layer
def change_password(self, session: Session, user_id: UUID, old_pw: str, new_pw: str) -> User:
    """Change user password after verifying old password."""
    user = user_db.get_by_id(session, user_id)  # Query once
    if not user:
        raise UserNotFound(str(user_id))
    if not self.verify_password(user, old_pw):
        raise InvalidPasswordChange()

    # Update directly on fetched object (no re-query)
    user.hashed_password = password_manager.get_hash(new_pw)
    user.updated_at = datetime.now()
    session.flush()

    return user

# API Layer
@router.post("/change-password", response_model=Message)
def change_password(current_user: CurrentUserDep, password_data: ChangePasswordRequest, session: SessionDep):
    """Change current user's password."""
    user_service.change_password(session, current_user.id, password_data.old_password, password_data.new_password)

    # Commit (ONLY here, at the END)
    session.commit()

    return Message(message="Password changed successfully")
```

**Benefits:**
- 1 database query (fetch once, work with object)
- Consistent exception handling
- Clean separation of concerns
- No redundant checks

---

## Naming Conventions

### Service and Repository Methods

**Rule:** Class name provides context - don't repeat resource name in methods.

```python
# ✅ CORRECT
class UserService:
    def get(self, session: Session, user_id: UUID) -> Optional[User]: ...
    def get_by_email(self, session: Session, email: str) -> Optional[User]: ...
    def create(self, session: Session, **kwargs) -> User: ...
    def update(self, session: Session, user_id: UUID, **kwargs) -> User: ...
    def delete(self, session: Session, user_id: UUID) -> None: ...
    def authenticate(self, session: Session, email: str, password: str) -> User: ...

# ❌ WRONG - Redundant "user" prefix
class UserService:
    def get_user(self, ...) -> Optional[User]: ...
    def create_user(self, ...) -> User: ...
    def update_user(self, ...) -> User: ...
```

### API Endpoints

**Rule:** URL path provides context - use simple action names.

```python
# ✅ CORRECT
@router.post("/signup")
def signup(data: SignupRequest):
    """Sign up a new user."""
    # Generated client: UsersService.signup()

@router.post("/login")
def login(data: LoginRequest):
    """Login user."""
    # Generated client: UsersService.login()

@router.get("/me")
def get_me(current_user: CurrentUserDep):
    """Get current user profile."""
    # Generated client: UsersService.getMe()

@router.put("/")
def update(current_user: CurrentUserDep, data: UpdateUserRequest):
    """Update current user."""
    # Generated client: UsersService.update()

# ❌ WRONG - Redundant context
@router.post("/login")
def user_login_endpoint(data: LoginRequest):
    # Generated client: UsersService.userLoginEndpoint() - redundant!
```

### Response Models

**Rule:** Don't add "Response" suffix - the context is clear.

```python
# ✅ CORRECT
class Auth(BaseModel):
    """Authentication response with token and user data."""
    access_token: str
    user: UserPublic

class Message(BaseModel):
    """Simple message response."""
    message: str

@router.post("/login", response_model=Auth)  # Clear from response_model
def login(data: LoginRequest):
    return Auth(access_token=token, user=user)

# ❌ WRONG - Redundant suffix
class AuthResponse(BaseModel):  # "Response" is redundant
    access_token: str
    user: UserPublic
```

---

## Quick Reference Checklist

### DB Layer (`db.py`)
- [ ] Methods take objects (not IDs) for update/delete
- [ ] Only `session.flush()`, never `session.commit()`
- [ ] Return types: `User`, `Optional[User]`, `bool`, `None`
- [ ] No business logic, no exceptions

### Service Layer (`*.py`)
- [ ] All business logic here
- [ ] Query once at start, work with object
- [ ] Raise exceptions for errors (never return `None` for operations)
- [ ] Only `session.flush()`, never `session.commit()`
- [ ] Clean method names (no resource prefix)

### API Layer (`api.py`)
- [ ] Use `CurrentUserDep` for user-specific operations
- [ ] No redundant `if not` checks (service raises exceptions)
- [ ] Only one `session.commit()` per endpoint (at END)
- [ ] Let exceptions bubble up (global handler catches)
- [ ] Clean function names (simple actions)

### Exceptions
- [ ] Module-specific exceptions in `{module}/exceptions.py`
- [ ] Common exceptions in `backend/core/exceptions.py`
- [ ] Raise in service layer, let bubble to API layer
- [ ] Include `MESSAGE` class constant
- [ ] Proper HTTP status codes

### Naming
- [ ] Service methods: `get()`, `create()`, `update()`, not `get_user()`, `create_user()`
- [ ] API functions: `login()`, `signup()`, not `user_login()`, `user_signup()`
- [ ] Response models: `Auth`, `Message`, not `AuthResponse`, `MessageResponse`

---

## Benefits of This Architecture

✅ **No redundant queries** - Query once, work with object
✅ **Consistent exception handling** - All in service layer
✅ **Clear separation of concerns** - Each layer has single responsibility
✅ **Atomic transactions** - All or nothing with single commit
✅ **Easier to test** - Service layer is pure business logic
✅ **Composable services** - Services can call each other safely
✅ **Better error messages** - Exceptions have context
✅ **Cleaner code** - No redundant checks in API layer
