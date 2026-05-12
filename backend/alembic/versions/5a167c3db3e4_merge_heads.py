"""merge heads

Revision ID: 5a167c3db3e4
Revises: b1b2c3d4e5f6, e7a1b2c3d4e6
Create Date: 2026-05-11 23:50:46.327560

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '5a167c3db3e4'
down_revision: Union[str, Sequence[str], None] = ('b1b2c3d4e5f6', 'e7a1b2c3d4e6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
