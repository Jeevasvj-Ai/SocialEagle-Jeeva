"""Roast model: the AI-generated scored review of a submitted assignment."""
import enum

from sqlalchemy import CheckConstraint, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import JSON

from app.models.base import Base


class RoastSeverity(enum.Enum):
    """Overall severity of the feedback in a roast."""

    low = "low"
    medium = "medium"
    high = "high"


class Roast(Base):
    """An AI-generated roast (scored review) for an assignment.

    One roast per assignment for MVP, enforced via a unique constraint
    on assignment_id.
    """

    __tablename__ = "roasts"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(
        Integer,
        ForeignKey("assignments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    score = Column(Integer, nullable=False)
    feedback_text = Column(Text, nullable=False)
    severity = Column(Enum(RoastSeverity), nullable=False)
    categories = Column(JSON, nullable=False, default=list)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    assignment = relationship("Assignment", back_populates="roast")

    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="ck_roasts_score_range"),
    )
