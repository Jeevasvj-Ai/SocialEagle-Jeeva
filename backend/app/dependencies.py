"""Shared FastAPI dependencies.

`get_db` delegates to `app.database`, which is owned by DATABASE-AGENT and is
expected to expose the standard SQLAlchemy trio: `engine`, `SessionLocal`,
and a `get_db` generator dependency. We re-export it here so routers/services
have one stable import path (`app.dependencies`) regardless of how the
database module evolves.

`get_current_user` decodes the bearer access token via `app.auth.jwt` and
loads the corresponding User from the database.
"""
import logging
from collections.abc import Generator

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.jwt import verify_token
from app.exceptions import UnauthorizedError
from app.models.user import User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

try:
    from app.database import get_db  # noqa: F401  (re-exported for convenience)
except ImportError:  # pragma: no cover - database module not yet created
    logger.warning("app.database not found yet; using placeholder get_db")

    def get_db() -> Generator[Session, None, None]:
        """Placeholder DB session dependency.

        Will be replaced once app.database.get_db (owned by DATABASE-AGENT)
        is available. Raises to avoid silently running without a real DB
        session.
        """
        raise NotImplementedError(
            "Database layer is not wired up yet. app.database.get_db must "
            "be implemented before this dependency can be used."
        )
        yield  # pragma: no cover - makes this a generator for Depends()


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the currently authenticated user from a bearer access token.

    Decodes the JWT, verifies it is an access token, and loads the matching
    active user from the database. Raises UnauthorizedError if the token is
    missing, invalid, expired, or the user cannot be found/is inactive.
    """
    if token is None:
        raise UnauthorizedError("Not authenticated")

    payload = verify_token(token, expected_type="access")
    if payload is None:
        raise UnauthorizedError("Invalid or expired token")

    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError("Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise UnauthorizedError("User not found or inactive")

    return user
