from app.main import get_origins
from app.core.config import settings
from fastapi.testclient import TestClient
from sqlmodel import Session
from unittest.mock import patch

def test_get_origins_empty():
    with patch.object(settings, "BACKEND_CORS_ORIGINS", []):
        assert get_origins() == []

def test_list_tasks_filter_by_category(client: TestClient, session: Session, admin_user, default_category):
    # Login as admin
    response = client.post(
        "/api/v1/auth/login", data={"username": "admin", "password": "test_admin_password"}
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a task with the category
    client.post(
        "/api/v1/tasks/",
        headers=headers,
        json={
            "title": "Category Task",
            "category_id": str(default_category.id),
            "priority": "MEDIUM"
        }
    )

    # Filter by category
    response = client.get(f"/api/v1/tasks/?category_id={default_category.id}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(t["category_id"] == str(default_category.id) for t in data)
