from datetime import datetime, timezone
from typing import List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel


class OrganizationBase(SQLModel):
    name: str = Field(min_length=1, unique=True)
    description: str = Field(default="")
    is_active: bool = Field(default=True)


class Organization(OrganizationBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    users: List["User"] = Relationship(back_populates="organization")


class OrganizationPublic(OrganizationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime


class UserBase(SQLModel):
    email: str = Field(min_length=1, unique=True)
    username: str = Field(min_length=1, unique=True)
    full_name: str = Field(min_length=1)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    org_id: UUID = Field(foreign_key="organization.id")


class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str = Field(min_length=1)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    organization: Organization = Relationship(back_populates="users")


class UserPublic(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
