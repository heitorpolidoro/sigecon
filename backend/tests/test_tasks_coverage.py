import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.enums import TaskStatus, TaskPriority, UserRole
from app.core.security import get_password_hash
from app.models.user import User
from app.models.task import Task

def get_token(client, username, password):
    response = client.post(
        "/api/v1/auth/login", data={"username": username, "password": password}
    )
    return response.json()["access_token"]

@pytest.fixture(name="setup_data")
def setup_data_fixture(session: Session):
    director = User(
        id=uuid.uuid4(),
        username="dir_cov",
        email="dir_cov@test.com",
        full_name="Director Cov",
        hashed_password=get_password_hash("pass"),
        role=UserRole.DIRETOR,
    )
    employee1 = User(
        id=uuid.uuid4(),
        username="emp1_cov",
        email="emp1_cov@test.com",
        full_name="Employee 1",
        hashed_password=get_password_hash("pass"),
        role=UserRole.FUNCIONARIO,
    )
    employee2 = User(
        id=uuid.uuid4(),
        username="emp2_cov",
        email="emp2_cov@test.com",
        full_name="Employee 2",
        hashed_password=get_password_hash("pass"),
        role=UserRole.FUNCIONARIO,
    )
    session.add_all([director, employee1, employee2])
    session.commit()

    task1 = Task(
        title="Task 1",
        status=TaskStatus.PENDING,
        priority=TaskPriority.LOW,
        assigned_to_id=employee1.id,
        created_by_id=director.id
    )
    task2 = Task(
        title="Task 2",
        status=TaskStatus.IN_PROGRESS,
        priority=TaskPriority.MEDIUM,
        assigned_to_id=employee2.id,
        created_by_id=director.id
    )
    session.add_all([task1, task2])
    session.commit()

    return {
        "director": director,
        "emp1": employee1,
        "emp2": employee2,
        "task1": task1,
        "task2": task2
    }

def test_list_tasks_filters(client: TestClient, session: Session, setup_data):
    token = get_token(client, "dir_cov", "pass")
    
    # Filter by status
    response = client.get(
        "/api/v1/tasks/?status=PENDING",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Task 1"

    # Filter by priority
    response = client.get(
        "/api/v1/tasks/?priority=MEDIUM",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Task 2"

    # Filter by assigned_to_id
    response = client.get(
        f"/api/v1/tasks/?assigned_to_id={setup_data['emp1'].id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Task 1"

def test_list_tasks_employee_scope(client: TestClient, session: Session, setup_data):
    token = get_token(client, "emp1_cov", "pass")
    
    response = client.get(
        "/api/v1/tasks/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    # Should only see task1
    titles = [t["title"] for t in response.json()]
    assert "Task 1" in titles
    assert "Task 2" not in titles

def test_delete_task_workflow(client: TestClient, session: Session, setup_data):
    token = get_token(client, "dir_cov", "pass")
    task_id = setup_data["task1"].id

    # Delete task
    response = client.delete(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 204

    # Try to delete again (404)
    response = client.delete(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

    # Try to update deleted task (404)
    response = client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "New Title"}
    )
    assert response.status_code == 404

    # Try to get history of deleted task (404)
    response = client.get(
        f"/api/v1/tasks/{task_id}/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

def test_history_forbidden(client: TestClient, session: Session, setup_data):
    # emp1 tries to see history of task2 (assigned to emp2)
    token = get_token(client, "emp1_cov", "pass")
    task_id = setup_data["task2"].id

    response = client.get(
        f"/api/v1/tasks/{task_id}/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

def test_history_not_found(client: TestClient, session: Session, setup_data):
    token = get_token(client, "dir_cov", "pass")
    random_id = uuid.uuid4()
    
    response = client.get(
        f"/api/v1/tasks/{random_id}/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
