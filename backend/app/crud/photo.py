from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.photo import Photo
from app.models.task import Task
from app.schemas.photo import PhotoCreate, PhotoUpdate


def get_photo(db: Session, photo_id: int) -> Optional[Photo]:
    """Получение одной фотографии по идентификатору со связанными заданиями."""
    return db.query(Photo).filter(Photo.id == photo_id).first()


def get_photos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[Photo]:
    """Получение списка фотографий с пагинацией и опциональной фильтрацией по статусу."""
    query = db.query(Photo)
    if status:
        query = query.filter(Photo.status == status)
    return query.order_by(Photo.id.desc()).offset(skip).limit(limit).all()


def create_photo(db: Session, photo_in: PhotoCreate) -> Photo:
    """Создание новой записи фотографии."""
    db_photo = Photo(
        url=str(photo_in.url),
        address=photo_in.address,
        status=photo_in.status.value if hasattr(photo_in.status, "value") else photo_in.status,
        issues_count=photo_in.issues_count,
    )
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo


def update_photo(db: Session, photo: Photo, photo_in: PhotoUpdate) -> Photo:
    """Обновление полей фотографии."""
    update_data = photo_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None and hasattr(value, "value"):
            value = value.value
        setattr(photo, field, value)

    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def delete_photo(db: Session, photo: Photo) -> None:
    """Удаление фотографии (связанные задания удаляются каскадно)."""
    db.delete(photo)
    db.commit()


def get_dashboard_stats(db: Session) -> dict:
    """Агрегация метрик для экрана статистики."""
    total_photos = db.query(func.count(Photo.id)).scalar() or 0
    processed_photos = (
        db.query(func.count(Photo.id))
        .filter(Photo.status == "processed")
        .scalar()
        or 0
    )
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    open_tasks = (
        db.query(func.count(Task.id))
        .filter(Task.status == "open")
        .scalar()
        or 0
    )

    return {
        "total_photos": total_photos,
        "processed_photos": processed_photos,
        "total_tasks": total_tasks,
        "open_tasks": open_tasks,
    }
