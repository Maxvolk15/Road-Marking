from pydantic import BaseModel, Field


class DashboardStatsResponse(BaseModel):
    """Сводная статистика для главного экрана (Dashboard)."""
    total_photos: int = Field(..., ge=0, description="Всего фото")
    processed_photos: int = Field(..., ge=0, description="Обработано фото")
    total_tasks: int = Field(..., ge=0, description="Всего заданий")
    open_tasks: int = Field(..., ge=0, description="Открытые задания")
