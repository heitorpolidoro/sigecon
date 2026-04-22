from uuid import UUID

class DomainException(Exception):
    """Base class for domain exceptions."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class TaskNotFoundError(DomainException):
    """Raised when a task is not found."""
    def __init__(self, task_id: UUID):
        super().__init__(f"Task with ID {task_id} not found")

class ForbiddenError(DomainException):
    """Raised when a user does not have permission for an action."""
    def __init__(self, message: str = "Not enough privileges"):
        super().__init__(message)
