"""Store refresh tokens as a SHA-256 hash instead of plaintext

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-20 00:00:01.000000

Refresh tokens are already high-entropy server-signed JWTs, so we hash them
before persisting (sha256 hex digest, 64 chars) rather than storing the raw
usable token. Existing rows can't be backfilled (the hash can't be derived
without the original token), so this migration drops and recreates the
column — any outstanding refresh tokens are invalidated, forcing affected
users to log in again. Acceptable for an MVP with no production traffic yet.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_refresh_tokens_token", table_name="refresh_tokens")
    op.drop_column("refresh_tokens", "token")
    # Any existing rows have no value to populate the new NOT NULL column
    # with (the hash can't be derived without the original token, which was
    # never stored anywhere else) — they're invalidated by this migration
    # anyway, so drop them rather than leaving an un-migratable NULL.
    op.execute("DELETE FROM refresh_tokens")
    op.add_column(
        "refresh_tokens",
        sa.Column("token_hash", sa.String(length=64), nullable=False),
    )
    op.create_index(
        "ix_refresh_tokens_token_hash", "refresh_tokens", ["token_hash"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_token_hash", table_name="refresh_tokens")
    op.drop_column("refresh_tokens", "token_hash")
    op.add_column(
        "refresh_tokens",
        sa.Column("token", sa.String(length=512), nullable=False),
    )
    op.create_index(
        "ix_refresh_tokens_token", "refresh_tokens", ["token"], unique=True
    )
