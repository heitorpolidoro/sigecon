from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, ForeignKey
from sqlmodel import Field, Relationship, SQLModel

from .enums import TaskPriority, TaskStatus

if TYPE_CHECKING:
    from .user import User

def get_utc_now():
    return datetime.now(UTC)

class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str | None = None
    status: TaskStatus = Field(default=TaskStatus.PENDING, index=True)
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, index=True)
    due_date: datetime | None = None
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    is_deleted: bool = Field(default=False, index=True)

    # Foreign Keys
    created_by_id: UUID = Field(foreign_key="user.id", index=True)
    assigned_to_id: UUID | None = Field(default=None, foreign_key="user.id", index=True)

    # Relationships
    creator: "User" = Relationship(
        back_populates="created_tasks",
        sa_relationship_kwargs={"foreign_keys": "Task.created_by_id"}
    )
    assignee: Optional["User"] = Relationship(
        back_populates="assigned_tasks",
        sa_relationship_kwargs={"foreign_keys": "Task.assigned_to_id"}
    )
    history: list["TaskHistory"] = Relationship(
        back_populates="task",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class TaskHistory(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(
        sa_column=Column(
            "task_id",
            ForeignKey("task.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    changed_by_id: UUID = Field(foreign_key="user.id")
    field_name: str
    old_value: str | None = None
    new_value: str | None = None
    timestamp: datetime = Field(default_factory=get_utc_now)

    # Relationships
    task: "Task" = Relationship(back_populates="history")
    changed_by: "User" = Relationship()
