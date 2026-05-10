"""add blocked to taskstatus

Revision ID: b1b2c3d4e5f6
Revises: a1b2c3d4e5f6
Create Date: 2026-05-08 14:35:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from sqlalchemy import create_engine

    engine = create_engine(op.get_context().config.get_main_option("sqlalchemy.url"))
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.execute(sa.text("ALTER TYPE taskstatus ADD VALUE IF NOT EXISTS 'BLOCKED'"))


def downgrade() -> None:
    pass
