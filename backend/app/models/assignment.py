"""Assignment model: a student's submitted code/project for roasting."""
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class SourceType(enum.Enum):
    """How the assignment content was submitted."""

    file = "file"
    repo_link = "repo_link"


class AssignmentStatus(enum.Enum):
    """Lifecycle status of an assignment."""

    draft = "draft"
    submitted = "submitted"
    reviewed = "reviewed"


class Assignment(Base, TimestampMixin):
    """A student's assignment submission."""

    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), nullable=False)
    source_type = Column(Enum(SourceType), nullable=False)
    source_url_or_path = Column(String(1000), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.draft, nullable=False)

    # Relationships
    student = relationship("User", back_populates="assignments")
    roast = relationship(
        "Roast", back_populates="assignment", uselist=False, cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_assignments_student_status", "student_id", "status"),
    )
