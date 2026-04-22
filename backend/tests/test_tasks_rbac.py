import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import get_password_hash
from app.models.enums import UserRole
from app.models.user import User


@pytest.fixture(name="test_users")
def test_users_fixture(session: Session):
    director = User(
        id=uuid.uuid4(),
        username="director",
        email="dir@test.com",
        full_name="Director Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.DIRETOR
    )
    employee = User(
        id=uuid.uuid4(),
        username="employee",
        email="emp@test.com",
        full_name="Employee Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.FUNCIONARIO
    )
    session.add(director)
    session.add(employee)
    session.commit()
    return {"director": director, "employee": employee}

def get_token(client, username, password):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": username, "password": password}
    )
    return response.json()["access_token"]

def test_rbac_task_workflow(client: TestClient, session: Session, test_users):
    dir_token = get_token(client, "director", "pass")
    emp_token = get_token(client, "employee", "pass")

    # 1. Funcionário não pode criar tarefas
    response = client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {emp_token}"},
        json={"title": "Unauthorized Task"}
    )
    assert response.status_code == 403

    # 2. Diretor cria tarefa para o funcionário
    response = client.post(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {dir_token}"},
        json={
            "title": "Valid Task",
            "assigned_to_id": str(test_users["employee"].id)
        }
    )
    assert response.status_code == 200
    task_id = response.json()["id"]

    # 3. Funcionário tenta mudar o TÍTULO (Proibido)
    response = client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {emp_token}"},
        json={"title": "Hacked Title"}
    )
    assert response.status_code == 403

    # 4. Funcionário muda o STATUS (Permitido)
    response = client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {emp_token}"},
        json={"status": "IN_PROGRESS"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "IN_PROGRESS"

    # 5. Verificar se o histórico foi criado
    response = client.get(
        f"/api/v1/tasks/{task_id}/history",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert len(response.json()) == 1
    assert response.json()[0]["field_name"] == "status"
