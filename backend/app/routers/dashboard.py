"""API endpoints for the student dashboard module."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummary:
    """Return the current user's dashboard summary.

    Includes assignment counts by status, average roast score, the most
    recent roasts, and a score trend suitable for charting.
    """
    return dashboard_service.build_dashboard_summary(db, current_user.id)
