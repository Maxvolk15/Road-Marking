from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import settings

# Инициализация движка SQLAlchemy
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Проверка соединения перед выполнением запроса
)

# Фабрика сессий базы данных
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для декларативных моделей SQLAlchemy
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency для получения сессии базы данных на время запроса.
    Автоматически закрывает сессию после завершения обработки запроса.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(drop_all: bool = False) -> None:
    """
    Создание всех таблиц в базе данных (если они ещё не созданы).
    Если drop_all=True, предварительно пересоздает таблицы.
    """
    import app.models  # noqa: F401 - регистрация моделей в Base.metadata
    if drop_all:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
