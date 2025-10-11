"""
SQLModel database models and schemas.
Defines core entities like User, Organization, and their relationships.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class BaseModel(SQLModel):
    """Base model with common fields for all tables."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class UserBase(SQLModel):
    """Base user model with shared fields."""

    email: str = Field(min_length=1, max_length=255, unique=True, index=True)
    full_name: str = Field(min_length=1, max_length=300)
    signup_verified: Optional[datetime] = Field(default=None)
    signup_token: Optional[str] = Field(default=None, max_length=255)
    auth_provider: str = Field(default="sample", max_length=50)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    is_admin: bool = Field(default=False, nullable=False)


class User(UserBase, BaseModel, table=True):
    """User model with authentication and profile data."""

    hashed_password: str = Field(min_length=1, max_length=255)

    forgot_password_tokens: List["ForgotPassword"] = Relationship(
        back_populates="user", cascade_delete=True
    )
    two_factor_auth: Optional["TwoFactorAuth"] = Relationship(
        back_populates="user", cascade_delete=True
    )


class UserPublic(SQLModel):
    """Public user model for API responses."""

    id: UUID
    email: str
    full_name: str
    signup_verified: Optional[datetime]
    auth_provider: str
    avatar_url: Optional[str]
    is_admin: bool
    two_fa_enabled: bool
    pending_2fa: bool = False
    created_at: datetime
    updated_at: datetime


class TwoFactorAuthBase(SQLModel):
    """Base two-factor authentication model."""

    is_enabled: bool = Field(default=False)


class TwoFactorAuth(TwoFactorAuthBase, BaseModel, table=True):
    """Two-factor authentication settings (TOTP only)."""

    __tablename__ = "two_factor_auth"

    user_id: UUID = Field(foreign_key="user.id", unique=True)
    totp_secret: str = Field(min_length=1, max_length=255)
    verified_at: Optional[datetime] = Field(default=None)

    user: "User" = Relationship(back_populates="two_factor_auth")


class ForgotPasswordBase(SQLModel):
    """Base forgot password model."""

    token: str = Field(min_length=1, max_length=255, unique=True, index=True)
    expires_at: datetime
    used_at: Optional[datetime] = Field(default=None)


class ForgotPassword(ForgotPasswordBase, BaseModel, table=True):
    """Password reset tokens."""

    __tablename__ = "forgot_password"

    user_id: UUID = Field(foreign_key="user.id", index=True)

    user: "User" = Relationship(back_populates="forgot_password_tokens")
