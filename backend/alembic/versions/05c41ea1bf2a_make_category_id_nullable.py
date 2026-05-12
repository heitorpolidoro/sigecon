"""make category_id nullable

Revision ID: 05c41ea1bf2a
Revises: 5a167c3db3e4
Create Date: 2026-05-12 21:46:17.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05c41ea1bf2a'
down_revision: Union[str, None] = '5a167c3db3e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make category_id nullable in task table
    op.alter_column('task', 'category_id',
               existing_type=sa.UUID(),
               nullable=True)


def downgrade() -> None:
    # Make category_id not nullable in task table
    # Note: This might fail if there are null values in the column
    op.alter_column('task', 'category_id',
               existing_type=sa.UUID(),
               nullable=False)
