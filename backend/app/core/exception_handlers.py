from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.exceptions import DomainException, TaskNotFoundError, ForbiddenError

async def domain_exception_handler(request: Request, exc: DomainException):
    status_code = status.HTTP_400_BAD_REQUEST
    
    if isinstance(exc, TaskNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, ForbiddenError):
        status_code = status.HTTP_403_FORBIDDEN
        
    return JSONResponse(
        status_code=status_code,
        content={"detail": exc.message},
    )
