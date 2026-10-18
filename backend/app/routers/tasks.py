from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import task as crud_task
from app.crud import photo as crud_photo
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskStatus,
)

router = APIRouter(prefix="/tasks", tags=["Задания на ремонт"])


@router.get(
    "/",
    response_model=List[TaskResponse],
    summary="Список заданий",
    description="Возвращает список ремонтных заданий с фильтрацией по фото, статусу и пагинацией."
)
def list_tasks(
    skip: int = Query(0, ge=0, description="Смещение для пагинации"),
    limit: int = Query(50, ge=1, le=100, description="Количество записей на страницу"),
    photo_id: Optional[int] = Query(None, description="Фильтр по связанной фотографии"),
    status: Optional[TaskStatus] = Query(None, description="Фильтр по статусу задания"),
    db: Session = Depends(get_db)
):
    status_str = status.value if status else None
    return crud_task.get_tasks(
        db=db,
        skip=skip,
        limit=limit,
        photo_id=photo_id,
        status=status_str
    )


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать задание на ремонт",
    description="Создает новое ремонтное задание. Требует обязательного указания существующего photo_id."
)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db)
):
    photo = crud_photo.get_photo(db=db, photo_id=task_in.photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Фотография с id {task_in.photo_id} не найдена. Невозможно создать связанное задание."
        )
    return crud_task.create_task(db=db, task_in=task_in)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Получить задание по ID",
    description="Возвращает подробности конкретного задания на ремонт дорожной разметки."
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задание с id {task_id} не найдено"
        )
    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Обновить задание",
    description="Полное или частичное обновление статуса или описания задания."
)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задание с id {task_id} не найдено"
        )

    if task_in.photo_id is not None and task_in.photo_id != task.photo_id:
        photo = crud_photo.get_photo(db=db, photo_id=task_in.photo_id)
        if not photo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Фотография с id {task_in.photo_id} не найдена. Невозможно перепривязать задание."
            )

    return crud_task.update_task(db=db, task=task, task_in=task_in)


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Частично обновить задание",
    description="Частичное обновление полей задания (например, смена статуса)."
)
def patch_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db)
):
    return update_task(task_id=task_id, task_in=task_in, db=db)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить задание",
    description="Удаляет запись ремонтного задания."
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = crud_task.get_task(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Задание с id {task_id} не найдено"
        )
    crud_task.delete_task(db=db, task=task)
    return None
