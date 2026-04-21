from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import Annotated
from uuid import UUID
from app.db import get_session
from app.api import deps
from app.models.task import Task
from app.models.user import User
from app.models.enums import TaskStatus, TaskPriority, UserRole
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate, TaskHistoryRead
from app.services.task_service import TaskService
from app.core.exceptions import TaskNotFoundError, ForbiddenError

router = APIRouter()

@router.post("/", response_model=TaskRead)
def create_task(
    task_in: TaskCreate, 
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_active_director)]
):
    """Apenas Diretores podem criar tarefas."""
    return TaskService.create_task(
        session=session,
        task_in=task_in,
        created_by_id=current_user.id
    )

@router.get("/", response_model=list[TaskRead])
def list_tasks(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)],
    status: TaskStatus | None = Query(None),
    priority: TaskPriority | None = Query(None),
    assigned_to_id: UUID | None = Query(None)
):
    """
    Lista tarefas.
    Diretores podem ver todas as tarefas.
    Funcionários podem ver apenas as tarefas atribuídas a eles.
    """
    statement = select(Task).where(Task.is_deleted == False)
    
    if current_user.role != UserRole.DIRETOR:
        statement = statement.where(Task.assigned_to_id == current_user.id)
    elif assigned_to_id:
        statement = statement.where(Task.assigned_to_id == assigned_to_id)
        
    if status:
        statement = statement.where(Task.status == status)
        
    if priority:
        statement = statement.where(Task.priority == priority)
    
    tasks = session.exec(statement).all()
    return tasks

@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)]
):
    """
    Diretor pode atualizar qualquer campo de qualquer tarefa.
    Funcionário pode atualizar APENAS o status de tarefas atribuídas a ele.
    """
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)
    
    task = TaskService.update_task(
        session=session,
        db_task=db_task,
        task_in=task_in,
        current_user=current_user
    )
    return task

@router.get("/{task_id}/history", response_model=list[TaskHistoryRead])
def get_task_history(
    task_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_user)]
):
    """Qualquer usuário autenticado pode ver o histórico de tarefas que ele tem acesso."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)
        
    if current_user.role != UserRole.DIRETOR and db_task.assigned_to_id != current_user.id:
        raise ForbiddenError()
        
    return TaskService.get_history(session=session, task_id=task_id)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(deps.get_current_active_director)]
):
    """Apenas Diretores podem excluir tarefas (Soft Delete)."""
    db_task = session.get(Task, task_id)
    if not db_task or db_task.is_deleted:
        raise TaskNotFoundError(task_id)
        
    TaskService.delete_task(
        session=session,
        db_task=db_task,
        changed_by_id=current_user.id
    )
    return None
