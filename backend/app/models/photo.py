from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.task import Task


class Photo(Base):
    """
    Модель фотографии дорожного участка.
    Хранит информацию об изображении, адресе, статусе обработки
    и количестве выявленных проблем.
    """
    __tablename__ = "photos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="processing")
    issues_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Связь один-ко-многим: одна фотография может иметь сформированные задания на ремонт
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="photo",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Photo id={self.id} status='{self.status}'>"
