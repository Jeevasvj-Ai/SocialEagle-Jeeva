"""Application configuration loaded from environment variables / .env file.

No hardcoded secrets: every secret-bearing field has no default and must be
supplied via the environment, otherwise Pydantic Settings will raise a
validation error at startup.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application settings.

    Required (no defaults — must be set via environment or .env):
        DATABASE_URL, SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
        LLM_API_KEY

    Optional (sane non-secret defaults):
        ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, VITE_API_URL
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Assignment Roaster"

    # Database
    DATABASE_URL: str

    # JWT auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # LLM provider (used by the roasting/scoring service)
    LLM_API_KEY: str

    # Backend's own public base URL (consumed by the frontend at build time
    # to know where to send API requests; also used server-side to build the
    # Google OAuth redirect_uri, which must point back at this backend).
    VITE_API_URL: str = "http://localhost:8000"

    # Frontend origin, used for CORS allow_origins. This is intentionally a
    # separate setting from VITE_API_URL (which is the backend's own URL).
    FRONTEND_ORIGIN: str = "http://localhost:5173"


settings = Settings()
