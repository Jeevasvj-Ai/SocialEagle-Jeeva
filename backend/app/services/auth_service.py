"""Business logic for registration, login, token refresh, and OAuth users."""
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
    verify_token,
)
from app.auth.jwt import REFRESH_TOKEN_EXPIRE_DAYS
from app.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import TokenResponse, UserCreate

logger = logging.getLogger(__name__)


def issue_token_pair(db: Session, user: User) -> TokenResponse:
    """Create a new access/refresh token pair and persist the refresh token."""
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        revoked=False,
    )
    db.add(db_refresh_token)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


def register_user(db: Session, payload: UserCreate) -> User:
    """Register a new user with email/password credentials."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing is not None:
        raise ConflictError("A user with this email already exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Registered new user id=%s", user.id)
    return user


def authenticate_user(db: Session, email: str, password: str) -> tuple[User, TokenResponse]:
    """Verify email/password credentials and issue a token pair."""
    user = db.query(User).filter(User.email == email).first()
    if user is None or user.hashed_password is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedError("This account is inactive")

    tokens = issue_token_pair(db, user)
    logger.info("User id=%s authenticated", user.id)
    return user, tokens


def refresh_access_token(db: Session, refresh_token: str) -> TokenResponse:
    """Validate a refresh token against the DB and rotate it for a new pair."""
    payload = verify_token(refresh_token, expected_type="refresh")
    if payload is None:
        raise UnauthorizedError("Invalid or expired refresh token")

    db_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == hash_refresh_token(refresh_token))
        .first()
    )
    if db_token is None or db_token.revoked:
        raise UnauthorizedError("Refresh token has been revoked or does not exist")

    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise UnauthorizedError("Refresh token has expired")

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    # Rotate: revoke the old refresh token before issuing a new pair.
    db_token.revoked = True
    db.add(db_token)
    db.commit()

    tokens = issue_token_pair(db, user)
    logger.info("Refresh token rotated for user id=%s", user.id)
    return tokens


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    """Revoke a refresh token (logout)."""
    db_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == hash_refresh_token(refresh_token))
        .first()
    )
    if db_token is None:
        raise NotFoundError("Refresh token")

    db_token.revoked = True
    db.add(db_token)
    db.commit()
    logger.info("Refresh token revoked for user id=%s", db_token.user_id)


def get_or_create_oauth_user(db: Session, email: str, full_name: str | None, provider: str = "google") -> User:
    """Fetch an existing user by email, or create a new OAuth-backed user."""
    user = db.query(User).filter(User.email == email).first()
    if user is not None:
        return user

    user = User(
        email=email,
        hashed_password=None,
        full_name=full_name,
        is_verified=True,
        oauth_provider=provider,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Created new OAuth user id=%s via %s", user.id, provider)
    return user
