"""Rename roles to ADMINISTRADOR and DIRETOR

Revision ID: 3c3d7b518f38
Revises: f6d2e0b038d1
Create Date: 2026-04-30 17:02:49.755414

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c3d7b518f38"
down_revision: str | Sequence[str] | None = "f6d2e0b038d1"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use a separate connection to run the ALTER TYPE command outside of the main migration transaction
    from sqlalchemy import create_engine

    engine = create_engine(op.get_context().config.get_main_option("sqlalchemy.url"))
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        conn.execute(
            sa.text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMINISTRADOR'")
        )

    # Data migration
    op.execute("UPDATE \"user\" SET role = 'ADMINISTRADOR' WHERE role = 'DIRETOR'")
    op.execute("UPDATE \"user\" SET role = 'DIRETOR' WHERE role = 'FUNCIONARIO'")


def downgrade() -> None:
    """Downgrade schema."""
    # O inverso da migração de dados
    op.execute("UPDATE \"user\" SET role = 'FUNCIONARIO' WHERE role = 'DIRETOR'")
    op.execute("UPDATE \"user\" SET role = 'DIRETOR' WHERE role = 'ADMINISTRADOR'")
    # Nota: Remover valores de ENUM no Postgres é complexo e requer recriar o tipo.
    # Por segurança, manteremos o valor ADMINISTRADOR no tipo, apenas os dados serão revertidos.
