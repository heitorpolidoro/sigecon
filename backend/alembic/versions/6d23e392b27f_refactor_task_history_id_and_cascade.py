"""refactor_task_history_id_and_cascade

Revision ID: 6d23e392b27f
Revises: 5702d6f1d1da
Create Date: 2026-04-20 19:38:39.942587

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6d23e392b27f'
down_revision: Union[str, Sequence[str], None] = '5702d6f1d1da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing FK first
    op.drop_constraint('taskhistory_task_id_fkey', 'taskhistory', type_='foreignkey')
    
    # Drop the ID column (which also drops the PK constraint)
    op.drop_column('taskhistory', 'id')
    
    # Add the ID column back as UUID
    op.add_column('taskhistory', sa.Column('id', sa.Uuid(), nullable=False))
    
    # Create the PK constraint
    op.create_primary_key('taskhistory_pkey', 'taskhistory', ['id'])
    
    # Re-create the FK with CASCADE
    op.create_foreign_key(None, 'taskhistory', 'task', ['task_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    op.drop_constraint(None, 'taskhistory', type_='foreignkey')
    op.drop_column('taskhistory', 'id')
    op.add_column('taskhistory', sa.Column('id', sa.Integer(), nullable=False))
    op.create_primary_key('taskhistory_pkey', 'taskhistory', ['id'])
    op.create_foreign_key('taskhistory_task_id_fkey', 'taskhistory', 'task', ['task_id'], ['id'])
