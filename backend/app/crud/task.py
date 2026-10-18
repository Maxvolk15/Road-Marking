from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskCreateForPhoto, TaskUpdate


def get_task(db: Session, task_id: int) -> Optional[Task]:
    """Получение одного задания по его ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    photo_id: Optional[int] = None,
    status: Optional[str] = None
) -> List[Task]:
    """Получение списка заданий с фильтрацией по photo_id, статусу и пагинацией."""
    query = db.query(Task)
    if photo_id is not None:
        query = query.filter(Task.photo_id == photo_id)
    if status is not None:
        query = query.filter(Task.status == status)

    return query.order_by(Task.id.desc()).offset(skip).limit(limit).all()


def get_tasks_by_photo(db: Session, photo_id: int) -> List[Task]:
    """Получение всех заданий для конкретной фотографии."""
    return db.query(Task).filter(Task.photo_id == photo_id).order_by(Task.id.asc()).all()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    """Создание нового ремонтного задания."""
    db_task = Task(
        photo_id=task_in.photo_id,
        description=task_in.description,
        address=task_in.address,
        status=task_in.status.value if hasattr(task_in.status, "value") else task_in.status,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def create_task_for_photo(db: Session, photo_id: int, task_in: TaskCreateForPhoto) -> Task:
    """Создание задания, привязанного к заданной фотографии."""
    db_task = Task(
        photo_id=photo_id,
        description=task_in.description,
        address=task_in.address,
        status=task_in.status.value if hasattr(task_in.status, "value") else task_in.status,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task: Task, task_in: TaskUpdate) -> Task:
    """Обновление атрибутов ремонтного задания."""
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None and hasattr(value, "value"):
            value = value.value
        setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    """Удаление ремонтного задания."""
    db.delete(task)
    db.commit()
