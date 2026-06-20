"""Pydantic schemas for the student dashboard module."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.roast import RoastSeverity


class RoastSummary(BaseModel):
    """Compact representation of a roast for dashboard listings."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    assignment_id: int
    assignment_title: str
    score: int
    severity: RoastSeverity
    generated_at: datetime


class ScoreTrendPoint(BaseModel):
    """A single point in the score-over-time trend, for charting."""

    generated_at: datetime
    score: int


class DashboardSummary(BaseModel):
    """Aggregate summary of a student's assignment/roast activity."""

    total_assignments: int
    by_status: dict[str, int]
    average_score: float | None
    recent_roasts: list[RoastSummary]
    score_trend: list[ScoreTrendPoint]
