"""Rename roles to ADMINISTRADOR and DIRETOR

Revision ID: 3c3d7b518f38
Revises: f6d2e0b038d1
Create Date: 2026-04-30 17:02:49.755414

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3c3d7b518f38'
down_revision: Union[str, Sequence[str], None] = 'f6d2e0b038d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Adicionar o novo valor ADMINISTRADOR ao ENUM
    # Nota: No Postgres, ALTER TYPE ADD VALUE não pode ser executado em um bloco de transação
    # Mas o Alembic geralmente roda em transação. Usamos a flag autocommit se necessário, 
    # ou rodamos SQL direto.
    op.execute("ALTER TYPE userrole ADD VALUE 'ADMINISTRADOR'")
    
    # 2. Migrar os dados existentes
    # Antigo DIRETOR -> ADMINISTRADOR
    # Antigo FUNCIONARIO -> DIRETOR
    op.execute("UPDATE \"user\" SET role = 'ADMINISTRADOR' WHERE role = 'DIRETOR'")
    op.execute("UPDATE \"user\" SET role = 'DIRETOR' WHERE role = 'FUNCIONARIO'")


def downgrade() -> None:
    """Downgrade schema."""
    # O inverso da migração de dados
    op.execute("UPDATE \"user\" SET role = 'FUNCIONARIO' WHERE role = 'DIRETOR'")
    op.execute("UPDATE \"user\" SET role = 'DIRETOR' WHERE role = 'ADMINISTRADOR'")
    # Nota: Remover valores de ENUM no Postgres é complexo e requer recriar o tipo.
    # Por segurança, manteremos o valor ADMINISTRADOR no tipo, apenas os dados serão revertidos.
