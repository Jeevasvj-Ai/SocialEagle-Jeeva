"""Pydantic schemas for the assignments module."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.assignment import AssignmentStatus, SourceType


class AssignmentCreate(BaseModel):
    """Payload for creating a new assignment (always starts as draft)."""

    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    language: str = Field(min_length=1, max_length=50)
    source_type: SourceType
    source_url_or_path: str = Field(min_length=1, max_length=1000)
    due_date: datetime | None = None


class AssignmentUpdate(BaseModel):
    """Payload for updating an existing assignment. All fields optional."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    language: str | None = Field(default=None, min_length=1, max_length=50)
    source_type: SourceType | None = None
    source_url_or_path: str | None = Field(default=None, min_length=1, max_length=1000)
    due_date: datetime | None = None


class AssignmentResubmit(BaseModel):
    """Payload for resubmitting an assignment with an updated source."""

    source_url_or_path: str = Field(min_length=1, max_length=1000)


class AssignmentResponse(BaseModel):
    """Public-facing representation of an assignment."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    title: str
    description: str | None
    language: str
    source_type: SourceType
    source_url_or_path: str
    due_date: datetime | None
    status: AssignmentStatus
    created_at: datetime
    updated_at: datetime | None


class AssignmentListResponse(BaseModel):
    """Paginated/aggregate list of assignments."""

    total: int
    items: list[AssignmentResponse]
