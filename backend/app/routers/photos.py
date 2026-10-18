from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import photo as crud_photo
from app.crud import task as crud_task
from app.schemas.photo import (
    PhotoCreate,
    PhotoUpdate,
    PhotoResponse,
    PhotoDetailResponse,
    PhotoStatus,
)
from app.schemas.task import TaskCreateForPhoto, TaskResponse

router = APIRouter(prefix="/photos", tags=["Фотографии и анализ"])


@router.get(
    "/",
    response_model=List[PhotoResponse],
    summary="Список фотографий",
    description="Возвращает список фотографий дорожных участков с поддержкой фильтрации по статусу и пагинации."
)
def list_photos(
    skip: int = Query(0, ge=0, description="Смещение для пагинации"),
    limit: int = Query(50, ge=1, le=100, description="Количество записей на страницу"),
    status: Optional[PhotoStatus] = Query(None, description="Фильтр по статусу обработки"),
    db: Session = Depends(get_db)
):
    status_str = status.value if status else None
    return crud_photo.get_photos(db=db, skip=skip, limit=limit, status=status_str)


@router.post(
    "/",
    response_model=PhotoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать запись фотографии",
    description="Добавляет новую фотографию улицы для последующего анализа разметки."
)
def create_photo(
    photo_in: PhotoCreate,
    db: Session = Depends(get_db)
):
    return crud_photo.create_photo(db=db, photo_in=photo_in)


@router.get(
    "/{photo_id}",
    response_model=PhotoDetailResponse,
    summary="Детальная информация о фотографии",
    description="Возвращает подробные данные о фотографии, включая список всех связанных сформированных заданий на ремонт."
)
def get_photo_detail(
    photo_id: int,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {photo_id} не найдена"
        )
    return photo


@router.put(
    "/{photo_id}",
    response_model=PhotoResponse,
    summary="Обновить фотографию",
    description="Обновляет метаданные, статус анализа или результаты распознавания для фотографии."
)
def update_photo(
    photo_id: int,
    photo_in: PhotoUpdate,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {photo_id} не найдена"
        )
    return crud_photo.update_photo(db=db, photo=photo, photo_in=photo_in)


@router.patch(
    "/{photo_id}",
    response_model=PhotoResponse,
    summary="Частично обновить фотографию",
    description="Частичное обновление полей фотографии."
)
def patch_photo(
    photo_id: int,
    photo_in: PhotoUpdate,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {photo_id} не найдена"
        )
    return crud_photo.update_photo(db=db, photo=photo, photo_in=photo_in)


@router.delete(
    "/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить фотографию",
    description="Удаляет запись фотографии и все связанные с ней ремонтные задания (каскадное удаление)."
)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {photo_id} не найдена"
        )
    crud_photo.delete_photo(db=db, photo=photo)
    return None


@router.get(
    "/{photo_id}/tasks",
    response_model=List[TaskResponse],
    summary="Задания для фотографии",
    description="Возвращает список всех ремонтных заданий, привязанных к данной фотографии."
)
def get_photo_tasks(
    photo_id: int,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {photo_id} не найдена"
        )
    return crud_task.get_tasks_by_photo(db=db, photo_id=photo_id)


@router.post(
    "/{photo_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать задание для фотографии",
    description="Создает новое ремонтное задание, напрямую связывая его с указанной фотографией."
)
def create_photo_task(
    photo_id: int,
    task_in: TaskCreateForPhoto,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Невозможно создать задание: фотография с id {photo_id} не существует"
        )
    return crud_task.create_task_for_photo(db=db, photo_id=photo_id, task_in=task_in)
