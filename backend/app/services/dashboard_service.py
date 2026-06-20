"""Business logic for the student dashboard module.

Builds an aggregate summary of a student's assignment/roast activity using
grouped/aggregate SQL queries (count, avg) rather than loading every row and
aggregating in Python, to keep this efficient as the dataset grows.
"""
import logging

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.roast import Roast
from app.schemas.dashboard import DashboardSummary, RoastSummary, ScoreTrendPoint

logger = logging.getLogger(__name__)

RECENT_ROASTS_LIMIT = 5


def _get_status_counts(db: Session, user_id: int) -> dict[str, int]:
    """Return a mapping of assignment status -> count for the given user."""
    rows = (
        db.query(Assignment.status, func.count(Assignment.id))
        .filter(Assignment.student_id == user_id)
        .group_by(Assignment.status)
        .all()
    )
    return {status.value: count for status, count in rows}


def _get_average_score(db: Session, user_id: int) -> float | None:
    """Return the average Roast.score across all of the user's assignments."""
    avg_score = (
        db.query(func.avg(Roast.score))
        .join(Assignment, Roast.assignment_id == Assignment.id)
        .filter(Assignment.student_id == user_id)
        .scalar()
    )
    return float(avg_score) if avg_score is not None else None


def _get_recent_roasts(db: Session, user_id: int) -> list[RoastSummary]:
    """Return the most recent roasts (desc by generated_at) for the user."""
    rows = (
        db.query(Roast, Assignment.title)
        .join(Assignment, Roast.assignment_id == Assignment.id)
        .filter(Assignment.student_id == user_id)
        .order_by(Roast.generated_at.desc())
        .limit(RECENT_ROASTS_LIMIT)
        .all()
    )
    return [
        RoastSummary(
            id=roast.id,
            assignment_id=roast.assignment_id,
            assignment_title=title,
            score=roast.score,
            severity=roast.severity,
            generated_at=roast.generated_at,
        )
        for roast, title in rows
    ]


def _get_score_trend(db: Session, user_id: int) -> list[ScoreTrendPoint]:
    """Return all of the user's roast scores ordered ascending by time."""
    rows = (
        db.query(Roast.generated_at, Roast.score)
        .join(Assignment, Roast.assignment_id == Assignment.id)
        .filter(Assignment.student_id == user_id)
        .order_by(Roast.generated_at.asc())
        .all()
    )
    return [ScoreTrendPoint(generated_at=generated_at, score=score) for generated_at, score in rows]


def build_dashboard_summary(db: Session, user_id: int) -> DashboardSummary:
    """Build the full dashboard summary for the given user."""
    by_status = _get_status_counts(db, user_id)
    total_assignments = sum(by_status.values())
    average_score = _get_average_score(db, user_id)
    recent_roasts = _get_recent_roasts(db, user_id)
    score_trend = _get_score_trend(db, user_id)

    logger.info("Built dashboard summary for user %s", user_id)

    return DashboardSummary(
        total_assignments=total_assignments,
        by_status=by_status,
        average_score=average_score,
        recent_roasts=recent_roasts,
        score_trend=score_trend,
    )
