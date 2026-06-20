"""Auth endpoints: register, login, refresh, logout, profile, Google OAuth."""
import logging

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.auth.oauth import build_google_auth_url, exchange_code_for_user_info
from app.config import settings
from app.dependencies import get_current_user, get_db
from app.exceptions import ValidationError
from app.models.user import User
from app.rate_limit import limiter
from app.schemas.auth import (
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services import auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CALLBACK_PATH = "/api/v1/auth/google/callback"


def _google_redirect_uri() -> str:
    """Build the redirect URI Google should send the user back to.

    Derived from VITE_API_URL (the backend's own base URL is not exposed via
    settings in Phase 1's config, so we reuse the frontend's configured host
    as the backend origin is expected to match it in local/dev setups).
    """
    return f"{settings.VITE_API_URL}{GOOGLE_CALLBACK_PATH}"


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """Register a new user with email/password credentials."""
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate with email/password and receive an access/refresh token pair."""
    _user, tokens = auth_service.authenticate_user(db, payload.email, payload.password)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Exchange a valid refresh token for a new access/refresh token pair."""
    return auth_service.refresh_access_token(db, payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> None:
    """Revoke a refresh token, logging the user out of that session."""
    auth_service.revoke_refresh_token(db, payload.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Update the currently authenticated user's profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/google")
async def google_login() -> RedirectResponse:
    """Redirect the user to Google's OAuth consent screen."""
    auth_url = build_google_auth_url(redirect_uri=_google_redirect_uri())
    return RedirectResponse(url=auth_url)


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(code: str, db: Session = Depends(get_db)) -> TokenResponse:
    """Exchange the Google authorization code, create/login the user, issue tokens."""
    if not code:
        raise ValidationError("Missing authorization code")

    user_info = await exchange_code_for_user_info(code, redirect_uri=_google_redirect_uri())
    email = user_info.get("email")
    if not email:
        raise ValidationError("Google did not return an email address")

    full_name = user_info.get("name")
    user = auth_service.get_or_create_oauth_user(db, email=email, full_name=full_name, provider="google")

    tokens = auth_service.issue_token_pair(db, user)
    logger.info("OAuth login completed for user id=%s", user.id)
    return tokens
