"""Business logic for the assignments module.

Ownership rule: a non-admin user may only view/create/edit/delete their own
assignments. Any access to an assignment that does not exist, or that exists
but is not owned by the current user (and the current user is not an admin),
raises NotFoundError — we deliberately do not leak existence via a 403, to
avoid exposing other students' assignment IDs.
"""
import logging

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError, ValidationError
from app.models.assignment import Assignment, AssignmentStatus
from app.models.user import User, UserRole
from app.schemas.assignment import AssignmentCreate, AssignmentResubmit, AssignmentUpdate

logger = logging.getLogger(__name__)


def _is_admin(user: User) -> bool:
    """Return True if the given user has the admin role."""
    return user.role == UserRole.admin


def list_assignments_for_user(db: Session, current_user: User) -> list[Assignment]:
    """List assignments owned by the current user.

    Admins still only see their own assignments here — this function is
    scoped to "my assignments"; a separate admin-only listing would be
    needed to see all students' assignments.
    """
    return (
        db.query(Assignment)
        .filter(Assignment.student_id == current_user.id)
        .order_by(Assignment.created_at.desc())
        .all()
    )


def get_assignment(db: Session, assignment_id: int, current_user: User) -> Assignment:
    """Fetch a single assignment, enforcing ownership.

    Raises:
        NotFoundError: if the assignment does not exist, or exists but is
            not owned by current_user and current_user is not an admin.
    """
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if assignment is None:
        raise NotFoundError("Assignment")
    if assignment.student_id != current_user.id and not _is_admin(current_user):
        raise NotFoundError("Assignment")
    return assignment


def create_assignment(db: Session, payload: AssignmentCreate, current_user: User) -> Assignment:
    """Create a new assignment for the current user, always starting as draft."""
    assignment = Assignment(
        student_id=current_user.id,
        title=payload.title,
        description=payload.description,
        language=payload.language,
        source_type=payload.source_type,
        source_url_or_path=payload.source_url_or_path,
        due_date=payload.due_date,
        status=AssignmentStatus.draft,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    logger.info("Assignment %s created by user %s", assignment.id, current_user.id)
    return assignment


def update_assignment(
    db: Session, assignment_id: int, payload: AssignmentUpdate, current_user: User
) -> Assignment:
    """Update an existing assignment, enforcing ownership."""
    assignment = get_assignment(db, assignment_id, current_user)

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)
    logger.info("Assignment %s updated by user %s", assignment.id, current_user.id)
    return assignment


def delete_assignment(db: Session, assignment_id: int, current_user: User) -> None:
    """Delete an assignment, enforcing ownership."""
    assignment = get_assignment(db, assignment_id, current_user)
    db.delete(assignment)
    db.commit()
    logger.info("Assignment %s deleted by user %s", assignment_id, current_user.id)


def submit_assignment(db: Session, assignment_id: int, current_user: User) -> Assignment:
    """Submit a draft assignment, transitioning it to status=submitted.

    Raises:
        ValidationError: if the assignment is not currently in draft status.
    """
    assignment = get_assignment(db, assignment_id, current_user)

    if assignment.status != AssignmentStatus.draft:
        raise ValidationError(
            f"Assignment must be in 'draft' status to submit (current: {assignment.status.value})"
        )

    assignment.status = AssignmentStatus.submitted
    db.commit()
    db.refresh(assignment)
    logger.info("Assignment %s submitted by user %s", assignment.id, current_user.id)
    return assignment


def resubmit_assignment(
    db: Session, assignment_id: int, payload: AssignmentResubmit, current_user: User
) -> Assignment:
    """Resubmit an assignment that has already been submitted or reviewed.

    Updates source_url_or_path and resets status back to submitted (e.g. so
    a fresh roast can be generated).

    Raises:
        ValidationError: if the assignment is not in 'submitted' or
            'reviewed' status.
    """
    assignment = get_assignment(db, assignment_id, current_user)

    if assignment.status not in (AssignmentStatus.submitted, AssignmentStatus.reviewed):
        raise ValidationError(
            "Assignment must be in 'submitted' or 'reviewed' status to "
            f"resubmit (current: {assignment.status.value})"
        )

    assignment.source_url_or_path = payload.source_url_or_path
    assignment.status = AssignmentStatus.submitted
    db.commit()
    db.refresh(assignment)
    logger.info("Assignment %s resubmitted by user %s", assignment.id, current_user.id)
    return assignment
