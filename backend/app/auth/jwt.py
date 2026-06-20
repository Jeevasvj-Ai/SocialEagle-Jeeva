"""JWT creation/verification and password hashing helpers."""
import hashlib
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Refresh tokens are not configurable via settings in Phase 1's config.py,
# so we default to 7 days here.
REFRESH_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(data: dict[str, Any], expires_delta: timedelta, token_type: Literal["access", "refresh"]) -> str:
    """Encode a JWT with the given payload, expiry, and token type claim."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    # A unique `jti` ensures two tokens minted for the same subject within
    # the same second (e.g. rapid login/refresh) never collide, since
    # refresh tokens are stored with a UNIQUE constraint on their value.
    to_encode.update({"exp": expire, "type": token_type, "jti": uuid.uuid4().hex})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str) -> str:
    """Create a short-lived access token for the given subject (user id)."""
    return _create_token(
        {"sub": subject},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "access",
    )


def create_refresh_token(subject: str) -> str:
    """Create a long-lived refresh token for the given subject (user id)."""
    return _create_token(
        {"sub": subject},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "refresh",
    )


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for storage.

    Refresh tokens are already high-entropy, server-signed JWTs, so a fast
    deterministic hash (not bcrypt, which is for low-entropy secrets like
    passwords) is sufficient and lets us look the token up by its hash
    without ever persisting the usable token value at rest.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_token(token: str, expected_type: Literal["access", "refresh"] | None = None) -> dict[str, Any] | None:
    """Decode and verify a JWT, optionally checking its `type` claim.

    Returns the decoded payload on success, or None if the token is invalid,
    expired, or does not match the expected type.
    """
    try:
        payload: dict[str, Any] = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        return None

    if expected_type is not None and payload.get("type") != expected_type:
        logger.warning("JWT type mismatch: expected %s, got %s", expected_type, payload.get("type"))
        return None

    return payload
