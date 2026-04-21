import re
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.models.enums import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.FUNCIONARIO

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one symbol")
        return v

class UserRead(UserBase):
    id: UUID
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
