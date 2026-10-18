from app.crud.photo import (
    get_photo,
    get_photos,
    create_photo,
    update_photo,
    delete_photo,
    get_dashboard_stats,
)
from app.crud.task import (
    get_task,
    get_tasks,
    get_tasks_by_photo,
    create_task,
    create_task_for_photo,
    update_task,
    delete_task,
)

__all__ = [
    "get_photo",
    "get_photos",
    "create_photo",
    "update_photo",
    "delete_photo",
    "get_dashboard_stats",
    "get_task",
    "get_tasks",
    "get_tasks_by_photo",
    "create_task",
    "create_task_for_photo",
    "update_task",
    "delete_task",
]
