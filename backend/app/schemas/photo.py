from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.task import TaskResponse


class PhotoStatus(str, Enum):
    PROCESSING = "processing"
    PROCESSED = "processed"
    ERROR = "error"


class PhotoBase(BaseModel):
    """Базовые атрибуты фотографии дорожного участка."""
    url: str = Field(..., min_length=1, max_length=1000, description="URL или путь к изображению")
    address: Optional[str] = Field(None, max_length=255, description="Адрес участка дороги")
    status: PhotoStatus = Field(default=PhotoStatus.PROCESSING, description="Статус обработки")
    issues_count: int = Field(default=0, ge=0, description="Количество выявленных проблем")


class PhotoCreate(BaseModel):
    """Схема создания новой записи фотографии."""
    url: str = Field(..., min_length=1, max_length=1000)
    address: Optional[str] = Field(None, max_length=255)
    status: PhotoStatus = Field(default=PhotoStatus.PROCESSING)
    issues_count: int = Field(default=0, ge=0)


class PhotoUpdate(BaseModel):
    """Схема обновления записи фотографии."""
    url: Optional[str] = Field(None, min_length=1, max_length=1000)
    address: Optional[str] = Field(None, max_length=255)
    status: Optional[PhotoStatus] = None
    issues_count: Optional[int] = Field(None, ge=0)


class PhotoResponse(PhotoBase):
    """Схема ответа API с метаданными фотографии."""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PhotoDetailResponse(PhotoResponse):
    """Детальный ответ с вложенным списком связанных заданий."""
    tasks: List[TaskResponse] = []

    model_config = ConfigDict(from_attributes=True)
