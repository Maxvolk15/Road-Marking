import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Добавляем backend в sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base, get_db
from app.main import app

# Создаем изолированную тестовую базу данных в памяти (SQLite in-memory with StaticPool)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Пересоздает таблицы перед каждым тестовым кейсом."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Сессия базы данных для проверок на уровне ORM."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Тестовый HTTP-клиент FastAPI с переопределенной сессией БД."""
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ==========================================
# 1. ТЕСТЫ СЛУЖЕБНЫХ ЭНДПОИНТОВ (Healthcheck)
# ==========================================

def test_healthcheck(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "It's alive!!!!!!!!!!"
    assert "version" in data


# ==========================================
# 2. ТЕСТЫ CRUD ФОТОГРАФИЙ (/api/m15/photos)
# ==========================================

def test_create_photo_success(client):
    payload = {
        "url": "https://images.oxu.az/test.jpg",
        "address": "ул. Гагарина, д. 10",
        "status": "processing",
        "issues_count": 0
    }
    response = client.post("/api/m15/photos/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["url"] == payload["url"]
    assert data["address"] == payload["address"]
    assert data["status"] == "processing"


def test_create_photo_validation_error(client):
    # Не передан обязательный url
    payload = {
        "address": "ул. Без Файла"
    }
    response = client.post("/api/m15/photos/", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "errors" in data


def test_get_photo_not_found(client):
    response = client.get("/api/m15/photos/999")
    assert response.status_code == 404
    assert "не найдена" in response.json()["detail"]


def test_get_photo_detail_with_tasks(client):
    # Создаем фото
    p_resp = client.post("/api/m15/photos/", json={
        "url": "https://example.com/crossroad.jpg",
        "address": "Центральная площадь",
        "status": "processed",
        "issues_count": 1
    })
    photo_id = p_resp.json()["id"]

    # Создаем связанное задание
    client.post(f"/api/m15/photos/{photo_id}/tasks", json={
        "description": "Покрасить стрелу направления",
        "address": "Центральная площадь",
        "status": "open"
    })

    # Получаем детализированный ответ фото
    detail_resp = client.get(f"/api/m15/photos/{photo_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == photo_id
    assert len(detail_data["tasks"]) == 1
    assert detail_data["tasks"][0]["description"] == "Покрасить стрелу направления"
    assert detail_data["tasks"][0]["status"] == "open"


def test_update_photo(client):
    p_resp = client.post("/api/m15/photos/", json={
        "url": "https://example.com/temp.jpg",
        "address": "пр. Победы, 5",
        "status": "processing",
        "issues_count": 0
    })
    photo_id = p_resp.json()["id"]

    # Обновляем статус и количество дефектов
    update_payload = {
        "status": "processed",
        "issues_count": 3
    }
    up_resp = client.patch(f"/api/m15/photos/{photo_id}", json=update_payload)
    assert up_resp.status_code == 200
    assert up_resp.json()["status"] == "processed"
    assert up_resp.json()["issues_count"] == 3


def test_delete_photo(client):
    p_resp = client.post("/api/m15/photos/", json={
        "url": "https://example.com/del.jpg",
        "address": "ул. Тестовая",
        "status": "processed"
    })
    photo_id = p_resp.json()["id"]

    del_resp = client.delete(f"/api/m15/photos/{photo_id}")
    assert del_resp.status_code == 204

    # Проверяем, что запись действительно удалена
    check_resp = client.get(f"/api/m15/photos/{photo_id}")
    assert check_resp.status_code == 404


# ==========================================
# 3. ТЕСТЫ CRUD ЗАДАНИЙ И СВЯЗЕЙ (/api/m15/tasks)
# ==========================================

def test_create_task_invalid_photo_id(client):
    # Попытка создать задачу для несуществующего photo_id -> 404
    payload = {
        "photo_id": 9999,
        "description": "Ремонт бордюра",
        "address": "ул. Мира",
        "status": "open"
    }
    response = client.post("/api/m15/tasks/", json=payload)
    assert response.status_code == 404
    assert "не найдена" in response.json()["detail"]


def test_task_crud_lifecycle(client):
    # 1. Создаем родительское фото
    p_resp = client.post("/api/m15/photos/", json={
        "url": "https://example.com/hw.jpg",
        "address": "Шоссе Энтузиастов",
        "status": "processed",
        "issues_count": 1
    })
    photo_id = p_resp.json()["id"]

    # 2. Создаем задание через POST /tasks/
    t_resp = client.post("/api/m15/tasks/", json={
        "photo_id": photo_id,
        "description": "Восстановить сплошную полосу разметки",
        "address": "Шоссе Энтузиастов",
        "status": "open"
    })
    assert t_resp.status_code == 201
    task_id = t_resp.json()["id"]
    assert t_resp.json()["status"] == "open"

    # 3. Читаем задание по ID
    get_t = client.get(f"/api/m15/tasks/{task_id}")
    assert get_t.status_code == 200
    assert get_t.json()["id"] == task_id

    # 4. Обновляем статус задания на "completed"
    patch_t = client.patch(f"/api/m15/tasks/{task_id}", json={"status": "completed"})
    assert patch_t.status_code == 200
    assert patch_t.json()["status"] == "completed"

    # 5. Список заданий с фильтром по статусу
    list_t = client.get("/api/m15/tasks/?status=completed")
    assert list_t.status_code == 200
    assert len(list_t.json()) == 1

    # 6. Удаляем задание
    del_t = client.delete(f"/api/m15/tasks/{task_id}")
    assert del_t.status_code == 204

    # 7. Проверяем отсутствие задания
    assert client.get(f"/api/m15/tasks/{task_id}").status_code == 404


def test_cascade_delete_photo_removes_tasks(client):
    """Проверка каскадного удаления связанных заданий при удалении фотографии."""
    # 1. Создаем фото
    p_resp = client.post("/api/m15/photos/", json={
        "url": "https://example.com/park.jpg",
        "address": "Парковая аллея",
        "status": "processed"
    })
    photo_id = p_resp.json()["id"]

    # 2. Создаем два связанных задания
    t1 = client.post(f"/api/m15/photos/{photo_id}/tasks", json={
        "description": "Задание 1",
        "address": "Парковая аллея",
        "status": "open"
    }).json()
    t2 = client.post(f"/api/m15/photos/{photo_id}/tasks", json={
        "description": "Задание 2",
        "address": "Парковая аллея",
        "status": "in_progress"
    }).json()

    # Убеждаемся, что задания существуют
    assert client.get(f"/api/m15/tasks/{t1['id']}").status_code == 200
    assert client.get(f"/api/m15/tasks/{t2['id']}").status_code == 200

    # 3. Удаляем фотографию
    client.delete(f"/api/m15/photos/{photo_id}")

    # 4. Проверяем, что связанные задания удалены каскадно
    assert client.get(f"/api/m15/tasks/{t1['id']}").status_code == 404
    assert client.get(f"/api/m15/tasks/{t2['id']}").status_code == 404


# ==========================================
# 4. ТЕСТЫ ДАШБОРДА И СТАТИСТИКИ (/api/m15/stats)
# ==========================================

def test_dashboard_stats(client):
    # Создаем 3 фото: 2 processed, 1 error
    p1 = client.post("/api/m15/photos/", json={
        "url": "http://f1.jpg", "address": "Адрес 1", "status": "processed"
    }).json()
    p2 = client.post("/api/m15/photos/", json={
        "url": "http://f2.jpg", "address": "Адрес 2", "status": "processed"
    }).json()
    client.post("/api/m15/photos/", json={
        "url": "http://f3.jpg", "address": "Адрес 3", "status": "error"
    })

    # Создаем 2 задания: 1 open, 1 completed
    client.post(f"/api/m15/photos/{p1['id']}/tasks", json={
        "description": "Ремонт 1", "address": "Адрес 1", "status": "open"
    })
    client.post(f"/api/m15/photos/{p2['id']}/tasks", json={
        "description": "Ремонт 2", "address": "Адрес 2", "status": "completed"
    })

    resp = client.get("/api/m15/stats/")
    assert resp.status_code == 200
    stats = resp.json()

    assert stats["total_photos"] == 3
    assert stats["processed_photos"] == 2
    assert stats["total_tasks"] == 2
    assert stats["open_tasks"] == 1
