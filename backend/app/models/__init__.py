"""Model package: import all models here so Alembic's autogenerate and
SQLAlchemy's mapper configuration can discover every table via Base.metadata.
"""
from app.models.base import Base, TimestampMixin
from app.models.user import User, UserRole
from app.models.refresh_token import RefreshToken
from app.models.assignment import Assignment, AssignmentStatus, SourceType
from app.models.roast import Roast, RoastSeverity

__all__ = [
    "Base",
    "TimestampMixin",
    "User",
    "UserRole",
    "RefreshToken",
    "Assignment",
    "AssignmentStatus",
    "SourceType",
    "Roast",
    "RoastSeverity",
]
