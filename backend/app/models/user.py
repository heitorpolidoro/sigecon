from uuid import UUID, uuid4
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .enums import UserRole

if TYPE_CHECKING:
    from .task import Task

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: str
    role: UserRole = Field(default=UserRole.FUNCIONARIO)
    is_active: bool = Field(default=True)

    # Relationships
    created_tasks: list["Task"] = Relationship(
        back_populates="creator", 
        sa_relationship_kwargs={"foreign_keys": "Task.created_by_id"}
    )
    assigned_tasks: list["Task"] = Relationship(
        back_populates="assignee",
        sa_relationship_kwargs={"foreign_keys": "Task.assigned_to_id"}
    )
