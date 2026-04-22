"""Task management API endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select

from app.api import deps
from app.core.exceptions import ForbiddenError, TaskNotFoundError
from app.db import get_session
from app.models.enums import TaskPriority, TaskStatus, UserRole
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskHistoryRead, TaskRead, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter()


@router.post("/", response_model=TaskRead)
def create_task(
    task_in: TaskCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_active_director)],
):
    """Create a new task. Only Directors can create tasks.

    Args:
        task_in: Task data to create.
        session: Database session.
        current_user: The current authenticated director.

    Returns:
        Task: The created task.
    """
    return TaskService.create_task(
        session=session, task_in=task_in, created_by_id=current_user.id
    )


@router.get("/", response_model=list[TaskRead])
def list_tasks(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
    status: Annotated[TaskStatus | None, Query()] = None,
    priority: Annotated[TaskPriority | None, Query()] = None,
    assigned_to_id: Annotated[UUID | None, Query()] = None,
):
    """List tasks with optional filters.

    Directors can see all tasks.
    Employees can only see tasks assigned to them.

    Args:
        session: Database session.
        current_user: The current authenticated user.
        status: Filter by task status.
        priority: Filter by task priority.
        assigned_to_id: Filter by the user assigned to the task.

    Returns:
        list[Task]: List of tasks matching the criteria.
    """
    statement = select(Task).where(Task.is_deleted.is_(False))

    if current_user.role != UserRole.DIRETOR:
        statement = statement.where(Task.assigned_to_id == current_user.id)
    elif assigned_to_id:
        statement = statement.where(Task.assigned_to_id == assigned_to_id)

    if status:
        statement = statement.where(Task.status == status)

    if priority:
        statement = statement.where(Task.priority == priority)

    return session.exec(statement).all()


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """Update an existing task.

    Directors can update any field of any task.
    Employees can ONLY update the status of tasks assigned to them.

    Args:
        task_id: UUID of the task to update.
        task_in: Task data to update.
        session: Database session.
        current_user: The current authenticated user.

    Returns:
        Task: The updated task.

    Raises:
        TaskNotFoundError: If the task does not exist or is deleted.
    """
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)

    return TaskService.update_task(
        session=session, db_task=db_task, task_in=task_in, current_user=current_user
    )


@router.get("/{task_id}/history", response_model=list[TaskHistoryRead])
def get_task_history(
    task_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
):
    """Get the audit history for a specific task.

    Any authenticated user can see the history of tasks they have access to.

    Args:
        task_id: UUID of the task.
        session: Database session.
        current_user: The current authenticated user.

    Returns:
        list[TaskHistoryRead]: List of history entries.

    Raises:
        TaskNotFoundError: If the task does not exist or is deleted.
        ForbiddenError: If the user does not have access to the task.
    """
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)

    if (
        current_user.role != UserRole.DIRETOR
        and db_task.assigned_to_id != current_user.id
    ):
        raise ForbiddenError

    return TaskService.get_history(session=session, task_id=task_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_active_director)],
):
    """Delete a task (Soft Delete). Only Directors can delete tasks.

    Args:
        task_id: UUID of the task to delete.
        session: Database session.
        current_user: The current authenticated director.

    Raises:
        TaskNotFoundError: If the task does not exist or is deleted.
    """
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)

    TaskService.delete_task(
        session=session, db_task=db_task, changed_by_id=current_user.id
    )
