"""API endpoints for the reviews/roasts module."""
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.roast import RoastListResponse, RoastResponse
from app.services import roast_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["roasts"])


@router.post("/assignments/{assignment_id}/roast", response_model=RoastResponse, status_code=201)
async def trigger_roast(
    assignment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoastResponse:
    """Generate and persist a roast for a submitted assignment owned by the current user."""
    roast = await roast_service.create_roast_for_assignment(db, assignment_id, user)
    return RoastResponse.model_validate(roast)


@router.get("/assignments/{assignment_id}/roast", response_model=RoastResponse)
async def get_assignment_roast(
    assignment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoastResponse:
    """Get the latest roast for a specific assignment owned by the current user."""
    roast = roast_service.get_latest_roast_for_assignment(db, assignment_id, user)
    return RoastResponse.model_validate(roast)


@router.get("/roasts", response_model=RoastListResponse)
async def list_my_roasts(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoastListResponse:
    """List the current user's roast history."""
    total, items = roast_service.list_roasts_for_user(db, user, skip=skip, limit=limit)
    return RoastListResponse(
        total=total,
        items=[RoastResponse.model_validate(item) for item in items],
    )


@router.get("/roasts/{roast_id}", response_model=RoastResponse)
async def get_roast(
    roast_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoastResponse:
    """Get a single roast by id, owned by the current user."""
    roast = roast_service.get_roast_by_id(db, roast_id, user)
    return RoastResponse.model_validate(roast)
