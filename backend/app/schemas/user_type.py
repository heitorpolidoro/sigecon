"""UserType schemas."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserTypeCreate(BaseModel):
    """Schema for creating a new user type."""

    name: str


class UserTypeRead(BaseModel):
    """Schema for reading user type data."""

    id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class UserTypeUpdate(BaseModel):
    """Schema for updating an existing user type."""

    name: str
