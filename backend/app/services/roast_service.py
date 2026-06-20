"""Business logic for the reviews/roasts module.

Owns: generating a roast for a submitted assignment, fetching the latest
roast for an assignment, and listing a user's roast history. Ownership
checks against Assignment are written directly here (minimal, local query)
since app.services.assignment_service does not exist yet; if/when it lands,
callers can be migrated to reuse it.
"""
import logging

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.assignment import Assignment, AssignmentStatus
from app.models.roast import Roast, RoastSeverity
from app.models.user import User, UserRole
from app.services import roast_engine
from app.services.assignment_service import get_assignment as _get_owned_assignment

logger = logging.getLogger(__name__)


async def create_roast_for_assignment(db: Session, assignment_id: int, user: User) -> Roast:
    """Generate and persist a roast for a submitted assignment.

    Validates that the assignment belongs to the requesting user (or the
    user is an admin), that it is in 'submitted' status, and that it does
    not already have a roast (one roast per assignment for MVP). On
    success, persists the Roast row and transitions the assignment to
    'reviewed'.

    Args:
        db: Database session.
        assignment_id: The id of the assignment to roast.
        user: The currently authenticated user (for ownership check).

    Returns:
        The newly created Roast object.

    Raises:
        NotFoundError: If the assignment does not exist or isn't owned by user.
        ConflictError: If the assignment is not in 'submitted' status, or
            already has a roast.
        ValidationError: If the LLM response fails validation (propagated
            from roast_engine.generate_roast).
    """
    assignment = _get_owned_assignment(db, assignment_id, user)

    if assignment.status != AssignmentStatus.submitted:
        raise ConflictError(
            f"Assignment must be in 'submitted' status to be roasted "
            f"(current status: '{assignment.status.value}')"
        )

    existing = db.query(Roast).filter(Roast.assignment_id == assignment_id).first()
    if existing is not None:
        raise ConflictError("Assignment already has a roast")

    result = await roast_engine.generate_roast(assignment)

    roast = Roast(
        assignment_id=assignment.id,
        score=result["score"],
        feedback_text=result["feedback_text"],
        severity=RoastSeverity(result["severity"]),
        categories=result["categories"],
    )
    db.add(roast)

    assignment.status = AssignmentStatus.reviewed

    try:
        db.commit()
    except IntegrityError:
        # Lost a race against a concurrent roast-generation request for the
        # same assignment; the unique constraint on assignment_id caught it.
        db.rollback()
        raise ConflictError("Assignment already has a roast") from None
    db.refresh(roast)

    logger.info(
        "Persisted roast id=%s for assignment_id=%s by user_id=%s",
        roast.id,
        assignment.id,
        user.id,
    )
    return roast


def get_latest_roast_for_assignment(db: Session, assignment_id: int, user: User) -> Roast:
    """Fetch the most recent roast for an assignment owned by the user.

    Since MVP enforces one roast per assignment, this is equivalent to
    fetching the single existing roast row.

    Args:
        db: Database session.
        assignment_id: The id of the assignment.
        user: The currently authenticated user (for ownership check).

    Returns:
        The Roast object for this assignment.

    Raises:
        NotFoundError: If the assignment doesn't exist/isn't owned, or has
            no roast yet.
    """
    _get_owned_assignment(db, assignment_id, user)

    roast = (
        db.query(Roast)
        .filter(Roast.assignment_id == assignment_id)
        .order_by(Roast.generated_at.desc())
        .first()
    )
    if roast is None:
        raise NotFoundError("Roast")

    return roast


def list_roasts_for_user(db: Session, user: User, skip: int = 0, limit: int = 100) -> tuple[int, list[Roast]]:
    """List the roast history for the current user's assignments.

    Joins Assignment to filter roasts down to those belonging to the
    requesting student. Admins currently see only their own assignments'
    roasts too (no cross-user listing here, matching dashboard scoping
    rules in CLAUDE.md unless explicitly extended later).

    Args:
        db: Database session.
        user: The currently authenticated user.
        skip: Pagination offset.
        limit: Pagination page size.

    Returns:
        Tuple of (total_count, list of Roast objects for this page).
    """
    base_query = (
        db.query(Roast)
        .join(Assignment, Roast.assignment_id == Assignment.id)
        .filter(Assignment.student_id == user.id)
    )

    total = base_query.count()
    items = (
        base_query.order_by(Roast.generated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return total, items


def get_roast_by_id(db: Session, roast_id: int, user: User) -> Roast:
    """Fetch a single roast by id, enforcing ownership via its assignment.

    Args:
        db: Database session.
        roast_id: The id of the roast.
        user: The currently authenticated user (for ownership check).

    Returns:
        The Roast object.

    Raises:
        NotFoundError: If no such roast exists or it isn't owned by user
            (and user is not an admin).
    """
    roast = (
        db.query(Roast)
        .join(Assignment, Roast.assignment_id == Assignment.id)
        .filter(Roast.id == roast_id)
        .first()
    )
    if roast is None:
        raise NotFoundError("Roast")

    if roast.assignment.student_id != user.id and user.role != UserRole.admin:
        raise NotFoundError("Roast")

    return roast
