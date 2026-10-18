from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TaskStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TaskBase(BaseModel):
    """Базовые атрибуты задания на ремонт."""
    description: str = Field(..., min_length=3, max_length=1000, description="Описание ремонтных работ")
    address: Optional[str] = Field(None, max_length=255, description="Адрес участка дороги")
    status: TaskStatus = Field(default=TaskStatus.OPEN, description="Статус задания")


class TaskCreate(TaskBase):
    """Схема создания задания с указанием связанного фото."""
    photo_id: int = Field(..., gt=0, description="Идентификатор связанной фотографии")


class TaskCreateForPhoto(TaskBase):
    """Схема создания задания для конкретного фото (photo_id передается в URL)."""
    pass


class TaskUpdate(BaseModel):
    """Схема частичного обновления задания."""
    description: Optional[str] = Field(None, min_length=3, max_length=1000)
    address: Optional[str] = Field(None, max_length=255)
    status: Optional[TaskStatus] = None
    photo_id: Optional[int] = Field(None, gt=0)


class TaskResponse(TaskBase):
    """Схема ответа API с данными задания."""
    id: int
    photo_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
