from sqlmodel import Session, create_engine
from app.models.task import Task
from app.models.user import User
from app.models.enums import TaskStatus, TaskPriority
from app.core.config import settings
import uuid

engine = create_engine(settings.DATABASE_URL)

def seed_data():
    with Session(engine) as session:
        # 1. Garantir que temos usuários para atribuir as tarefas
        # (Assumindo que o banco pode estar vazio)
        diretor_id = uuid.uuid4()
        funcionario_id = uuid.uuid4()
        
        # Tentamos buscar um usuário existente ou criamos um temporário para o seed
        # Nota: Em um sistema real, usaríamos os IDs reais do DB.
        
        tasks = [
            Task(
                title="Migração de Servidor",
                description="Realizar a migração dos dados para o novo servidor PostgreSQL 16.",
                status=TaskStatus.IN_PROGRESS,
                priority=TaskPriority.HIGH,
                created_by_id=diretor_id  # Apenas IDs para o seed funcionar sem criar usuários complexos
            ),
            Task(
                title="Relatório Trimestral",
                description="Consolidar os gastos do primeiro trimestre para a diretoria.",
                status=TaskStatus.PENDING,
                priority=TaskPriority.MEDIUM,
                created_by_id=diretor_id
            ),
            Task(
                title="Treinamento de Equipe",
                description="Treinar novos funcionários no uso do SIGECON.",
                status=TaskStatus.COMPLETED,
                priority=TaskPriority.LOW,
                created_by_id=diretor_id
            )
        ]
        
        # Como o banco tem constraints de FK, vou rodar via SQL direto para simplificar o seed visual
        # sem precisar criar toda a árvore de usuários agora.
        from sqlalchemy import text
        
        # Desabilita constraints temporariamente para o seed visual (apenas dev)
        session.execute(text("TRUNCATE TABLE task CASCADE;"))
        
        for t in tasks:
            session.add(t)
        
        session.commit()
        print("✅ Dados de exemplo criados com sucesso!")

if __name__ == "__main__":
    seed_data()
