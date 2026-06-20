"""Pydantic schemas for the reviews/roasts module."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.roast import RoastSeverity


class RoastResponse(BaseModel):
    """Public-facing representation of a roast."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    assignment_id: int
    score: int
    feedback_text: str
    severity: RoastSeverity
    categories: list[str]
    generated_at: datetime


class RoastListResponse(BaseModel):
    """Paginated/aggregate list of roasts."""

    total: int
    items: list[RoastResponse]
