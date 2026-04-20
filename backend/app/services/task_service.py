from sqlmodel import Session, select
from uuid import UUID
from app.models.task import Task, TaskHistory, get_utc_now
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    def create_task(
        session: Session, 
        task_in: TaskCreate, 
        created_by_id: UUID
    ) -> Task:
        db_task = Task.model_validate(
            task_in, 
            update={"created_by_id": created_by_id}
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

    @staticmethod
    def update_task(
        session: Session, 
        task_id: UUID, 
        task_in: TaskUpdate, 
        changed_by_id: UUID
    ) -> Task | None:
        db_task = session.get(Task, task_id)
        if not db_task:
            return None

        update_data = task_in.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            old_value = getattr(db_task, key)
            if old_value != value:
                # Log the change
                history = TaskHistory(
                    task_id=task_id,
                    changed_by_id=changed_by_id,
                    field_name=key,
                    old_value=str(old_value) if old_value is not None else None,
                    new_value=str(value) if value is not None else None,
                    timestamp=get_utc_now()
                )
                session.add(history)
                setattr(db_task, key, value)
        
        db_task.updated_at = get_utc_now()
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        return db_task

    @staticmethod
    def get_history(session: Session, task_id: UUID) -> list[dict]:
        from app.models.user import User
        statement = (
            select(TaskHistory, User)
            .join(User, TaskHistory.changed_by_id == User.id)
            .where(TaskHistory.task_id == task_id)
            .order_by(TaskHistory.timestamp.desc())
        )
        results = session.exec(statement).all()
        history_list = []
        for history, user in results:
            item = history.model_dump()
            item["user_name"] = user.full_name or user.username
            history_list.append(item)
        return history_list
