"""Pydantic schemas for the auth module: registration, login, tokens."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    """Payload for registering a new user via email/password."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=100)


class UserLogin(BaseModel):
    """Payload for logging in with email/password."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-facing representation of a user."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    is_active: bool
    is_verified: bool
    oauth_provider: str | None
    role: UserRole
    created_at: datetime


class UserUpdate(BaseModel):
    """Payload for updating the current user's profile."""

    full_name: str | None = Field(default=None, max_length=100)


class TokenResponse(BaseModel):
    """Access + refresh token pair returned on login/register/refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Payload for exchanging a refresh token for a new token pair."""

    refresh_token: str
