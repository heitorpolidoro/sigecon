import pytest
from pydantic import ValidationError
from app.schemas.task import TaskCreate, TaskUpdate
from app.models.enums import TaskStatus, TaskPriority

def test_task_create_validation():
    # Título é obrigatório
    with pytest.raises(ValidationError):
        TaskCreate(description="No title")
    
    # Enums válidos
    task = TaskCreate(title="Valid", priority=TaskPriority.HIGH)
    assert task.priority == "HIGH"

def test_task_update_partial():
    # Update deve permitir apenas um campo
    update = TaskUpdate(status=TaskStatus.COMPLETED)
    assert update.status == TaskStatus.COMPLETED
    assert update.title is None
