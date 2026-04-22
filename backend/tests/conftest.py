import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, StaticPool, create_engine

from app.core.security import get_password_hash
from app.db import get_session
from app.main import app
from app.models.enums import UserRole
from app.models.user import User

# Disable rate limiting for tests
app.state.limiter.enabled = False

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

@pytest.fixture(name="admin_user")
def admin_user_fixture(session: Session):
    user = User(
        id=uuid.uuid4(),
        username="admin",
        email="admin@test.com",
        full_name="Admin User",
        hashed_password=get_password_hash("test_admin_password"),
        role=UserRole.DIRETOR
    )
    session.add(user)
    session.commit()
    return user

@pytest.fixture(name="normal_user")
def normal_user_fixture(session: Session):
    user = User(
        id=uuid.uuid4(),
        username="user1",
        email="user1@test.com",
        full_name="Normal User",
        hashed_password=get_password_hash("test_user_password"),
        role=UserRole.FUNCIONARIO
    )
    session.add(user)
    session.commit()
    return user
