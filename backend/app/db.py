from sqlmodel import Session, create_engine

from app.core.config import settings

engine = create_engine(settings.database_url, echo=getattr(settings, "SQL_ECHO", False))


def get_session():
    """
    Generator for database sessions.

    Yields:
        Session: A SQLModel session.
    """
    with Session(engine) as session:
        yield session
