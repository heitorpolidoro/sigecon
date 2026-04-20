from sqlmodel import Session, select, create_engine
from app.models.user import User
from app.models.enums import UserRole
from app.core.config import settings
from app.core.security import get_password_hash
import uuid

def seed_db():
    engine = create_engine(settings.DATABASE_URL)
    with Session(engine) as session:
        # 1. Admin / Diretor
        statement = select(User).where(User.username == "admin")
        admin = session.exec(statement).first()
        if not admin:
            admin = User(
                id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
                username="admin",
                email="admin@sigecon.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Diretor Administrativo",
                role=UserRole.DIRETOR
            )
            session.add(admin)
            print("Admin seed criado.")
        else:
            admin.hashed_password = get_password_hash("admin123")
            session.add(admin)
            print("Senha do Admin atualizada.")
        
        # 2. Funcionário
        statement = select(User).where(User.username == "user1")
        user1 = session.exec(statement).first()
        if not user1:
            user1 = User(
                id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
                username="user1",
                email="user1@sigecon.com",
                hashed_password=get_password_hash("user123"),
                full_name="Funcionário Operacional",
                role=UserRole.FUNCIONARIO
            )
            session.add(user1)
            print("Funcionário seed criado.")
            
        session.commit()

if __name__ == "__main__":
    seed_db()
