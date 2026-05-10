import uuid
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.enums import UserRole, TaskStatus, TaskPriority
from app.models.user import User
from app.models.task import Task
from sqlmodel import Session, create_engine, select

def seed_dev():
    engine = create_engine(settings.database_url)
    with Session(engine) as session:
        print("🌱 Iniciando seed de desenvolvimento...")

        # 1. Limpar banco para garantir estado limpo (Apenas Dev)
        from sqlalchemy import text
        session.execute(text("TRUNCATE TABLE task CASCADE;"))
        session.execute(text('TRUNCATE TABLE "user" CASCADE;'))
        session.commit()

        # 2. Criar Administrador
        admin = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
            username="admin",
            email="admin@sigecon.com",
            hashed_password=get_password_hash("test_admin_password"),
            full_name="Administrador do Sistema",
            role=UserRole.ADMINISTRATOR,
            is_active=True,
        )
        session.add(admin)
        print("✅ Usuário Admin criado.")

        # 3. Criar Diretores
        diretores_data = [
            {
                "id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
                "username": "diretor1",
                "email": "diretor1@sigecon.com",
                "full_name": "Diretor Comercial",
            },
            {
                "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
                "username": "diretor2",
                "email": "diretor2@sigecon.com",
                "full_name": "Diretor Financeiro",
            }
        ]
        
        diretores = []
        for d_data in diretores_data:
            user = User(
                id=d_data["id"],
                username=d_data["username"],
                email=d_data["email"],
                hashed_password=get_password_hash("test_user_password"),
                full_name=d_data["full_name"],
                role=UserRole.DIRECTOR,
                is_active=True,
            )
            session.add(user)
            diretores.append(user)
            print(f"✅ {d_data['full_name']} criado.")

        session.commit()

        # 4. Criar Tarefas de Exemplo
        tasks_data = [
            {
                "title": "Migração de Servidor",
                "description": "Realizar a migração dos dados para o novo servidor PostgreSQL 16.",
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.HIGH,
                "assigned_to_id": diretores[0].id,
                "due_date": datetime.now() + timedelta(days=5)
            },
            {
                "title": "Relatório Trimestral",
                "description": "Consolidar os gastos do primeiro trimestre para a diretoria.",
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assigned_to_id": diretores[1].id,
                "due_date": datetime.now() + timedelta(days=10)
            },
            {
                "title": "Treinamento de Equipe",
                "description": "Treinar novos funcionários no uso do SIGECON.",
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.LOW,
                "assigned_to_id": diretores[0].id,
                "due_date": datetime.now() - timedelta(days=2)
            },
            {
                "title": "Revisão de Segurança",
                "description": "Auditoria completa nos logs de acesso do sistema.",
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.URGENT,
                "assigned_to_id": diretores[1].id,
                "due_date": datetime.now() + timedelta(days=1)
            },
            {
                "title": "Implementação do Kanban",
                "description": "Finalizar a visualização em colunas no dashboard do frontend.",
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assigned_to_id": diretores[0].id,
                "due_date": datetime.now()
            },
            {
                "title": "Ajuste de Budget",
                "description": "Redefinir as metas orçamentárias para o próximo semestre.",
                "status": TaskStatus.CANCELED,
                "priority": TaskPriority.LOW,
                "assigned_to_id": diretores[1].id,
                "due_date": None
            },
            {
                "title": "Dependência de Terceiros",
                "description": "Aguardando liberação da API do parceiro para continuar integração.",
                "status": TaskStatus.BLOCKED,
                "priority": TaskPriority.HIGH,
                "assigned_to_id": diretores[0].id,
                "due_date": datetime.now() + timedelta(days=3)
            }
        ]

        for t_data in tasks_data:
            task = Task(
                title=t_data["title"],
                description=t_data["description"],
                status=t_data["status"],
                priority=t_data["priority"],
                assigned_to_id=t_data["assigned_to_id"],
                created_by_id=admin.id,
                due_date=t_data["due_date"]
            )
            session.add(task)
        
        session.commit()
        print("✅ Tarefas de exemplo criadas.")
        print("🚀 Seed concluído com sucesso!")

if __name__ == "__main__":
    seed_dev()
