from app.routers.photos import router as photos_router
from app.routers.tasks import router as tasks_router
from app.routers.stats import router as stats_router

__all__ = ["photos_router", "tasks_router", "stats_router"]
