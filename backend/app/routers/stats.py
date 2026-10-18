from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import photo as crud_photo
from app.schemas.stats import DashboardStatsResponse

router = APIRouter(prefix="/stats", tags=["Статистика и аналитика"])


@router.get(
    "/",
    response_model=DashboardStatsResponse,
    summary="Статистика системы",
    description="Возвращает агрегированные данные для главной панели управления (количество фото, обработанных объектов, заданий и открытых дефектов)."
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud_photo.get_dashboard_stats(db=db)
