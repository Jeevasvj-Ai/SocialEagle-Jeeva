"""Shared pytest fixtures: test database, test client, and auth helpers.

Required environment variables (DATABASE_URL, SECRET_KEY, GOOGLE_CLIENT_ID,
GOOGLE_CLIENT_SECRET, LLM_API_KEY, VITE_API_URL) are set to dummy values
below *before* app.config.settings is imported anywhere, so Settings()
validation succeeds without a real .env file.
"""
import os
from collections.abc import Generator

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-google-client-secret")
os.environ.setdefault("LLM_API_KEY", "test-llm-api-key")
os.environ.setdefault("VITE_API_URL", "http://localhost:5173")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.auth.jwt import create_access_token, hash_password  # noqa: E402
from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.base import Base  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402

# In-memory SQLite shared across connections via StaticPool, so all sessions
# in a test see the same data.
TEST_DB_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    """Create all tables, yield a session, then drop all tables."""
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with the get_db dependency overridden to use `db`."""

    def _override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db: Session) -> User:
    """A registered, active student user with a known password."""
    user = User(
        email="student@example.com",
        hashed_password=hash_password("password123"),
        full_name="Test Student",
        role=UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def other_user(db: Session) -> User:
    """A second registered, active student user, for ownership-boundary tests."""
    user = User(
        email="other@example.com",
        hashed_password=hash_password("password456"),
        full_name="Other Student",
        role=UserRole.student,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def auth_headers(test_user: User) -> dict[str, str]:
    """Authorization header carrying a valid access token for test_user."""
    token = create_access_token(str(test_user.id))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def other_auth_headers(other_user: User) -> dict[str, str]:
    """Authorization header carrying a valid access token for other_user."""
    token = create_access_token(str(other_user.id))
    return {"Authorization": f"Bearer {token}"}
