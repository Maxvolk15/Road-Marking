from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.routers import photos_router, tasks_router, stats_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения:
    при старте инициализирует таблицы базы данных (если они ещё не созданы).
    """
    logger.info("Инициализация сервиса контроля дорожной разметки...")
    try:
        init_db()
        logger.info("Таблицы базы данных успешно проверены/созданы.")
    except Exception as exc:
        logger.warning(
            f"Не удалось подключиться к базе данных при запуске ({exc}). "
            "Убедитесь, что PostgreSQL запущен и строка подключения в .env корректна."
        )
    yield
    logger.info("Остановка сервиса.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "REST API сервер для системы автоматизированного контроля состояния дорожной разметки. "
        "Позволяет регистрировать фото дорожных участков, отслеживать статус анализа дефектов "
        "и формировать задания на проведение дорожно-ремонтных работ."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Кастомный обработчик ошибок валидации входных данных Pydantic (HTTP 422)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field_path = " -> ".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field_path,
            "message": err.get("msg"),
            "type": err.get("type"),
        })
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Ошибка валидации входных данных",
            "errors": errors,
        },
    )


# Базовый маршрут проверки работоспособности (Healthcheck)
@app.get("/health", tags=["Служебные"])
def healthcheck():
    return {
        "status": "It's alive!!!!!!!!!!",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Подключение модульных маршрутов API с единым префиксом /api/m15
app.include_router(photos_router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks_router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=settings.API_V1_PREFIX)
