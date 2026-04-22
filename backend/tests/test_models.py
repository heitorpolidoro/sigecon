from uuid import uuid4
from app.models.task import Task, TaskHistory
from app.models.user import User
from app.models.enums import TaskStatus, TaskPriority, UserRole

def test_user_model_creation():
    user = User(
        username="testuser",
        email="test@test.com",
        hashed_password="hash",
        full_name="Test User",
        role=UserRole.FUNCIONARIO
    )
    assert user.username == "testuser"
    assert user.role == UserRole.FUNCIONARIO
    assert user.is_active is True

def test_task_model_defaults():
    task = Task(
        title="New Task",
        created_by_id=uuid4(),
    )
    assert task.status == TaskStatus.PENDING
    assert task.priority == TaskPriority.MEDIUM
    assert task.created_at is not None

def test_task_history_model():
    history = TaskHistory(
        task_id=uuid4(),
        changed_by_id=uuid4(),
        field_name="status",
        old_value="PENDING",
        new_value="IN_PROGRESS"
    )
    assert history.field_name == "status"
    assert history.old_value == "PENDING"
