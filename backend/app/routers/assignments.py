"""API endpoints for the assignments module."""
import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentListResponse,
    AssignmentResponse,
    AssignmentResubmit,
    AssignmentUpdate,
)
from app.services import assignment_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("", response_model=AssignmentListResponse)
async def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentListResponse:
    """List the current user's assignments."""
    assignments = assignment_service.list_assignments_for_user(db, current_user)
    return AssignmentListResponse(total=len(assignments), items=assignments)


@router.post("", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentResponse:
    """Create a new assignment (always starts as draft)."""
    return assignment_service.create_assignment(db, payload, current_user)


@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentResponse:
    """Fetch a single assignment owned by the current user."""
    return assignment_service.get_assignment(db, assignment_id, current_user)


@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentResponse:
    """Update an assignment owned by the current user."""
    return assignment_service.update_assignment(db, assignment_id, payload, current_user)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an assignment owned by the current user."""
    assignment_service.delete_assignment(db, assignment_id, current_user)


@router.post("/{assignment_id}/submit", response_model=AssignmentResponse)
async def submit_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentResponse:
    """Submit a draft assignment, transitioning it to status=submitted."""
    return assignment_service.submit_assignment(db, assignment_id, current_user)


@router.post("/{assignment_id}/resubmit", response_model=AssignmentResponse)
async def resubmit_assignment(
    assignment_id: int,
    payload: AssignmentResubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AssignmentResponse:
    """Resubmit an assignment that was already submitted or reviewed."""
    return assignment_service.resubmit_assignment(db, assignment_id, payload, current_user)
