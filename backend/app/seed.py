"""
Скрипт первоначального заполнения базы данных данными из фронтенда.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models.photo import Photo
from app.models.task import Task


def seed(reset: bool = True):
    print("Инициализация таблиц базы данных...")
    init_db(drop_all=reset)

    db = SessionLocal()
    try:
        print("Добавление демонстрационных данных...")

        p1 = Photo(
            url="https://images.oxu.az/2024/08/05/1xIZX9xHfESJRfnj64aCMy8S9YV47DhGnpUD1SDa:1200.jpg",
            address="ул. Ленина, 15",
            status="processed",
            issues_count=2,
        )
        p2 = Photo(
            url="https://cdn.iportal.ru/news/2017/preview/6d37d6b6dc378807820fe1d6c17a321208b7ee3c_1280.jpg",
            address="пр-т Мира, 42",
            status="processing",
            issues_count=0,
        )
        p3 = Photo(
            url="https://avatars.dzeninfra.ru/get-zen_doc/1592433/pub_62c27ee00925c9323520d332_62c2846e4b3d3f57880533e0/scale_1200",
            address="ул. Пушкина, 10",
            status="processed",
            issues_count=1,
        )
        p4 = Photo(
            url="https://gorodkirov.ru/media/django-summernote/2023-06-20/83d7f024-ee88-4152-8c22-980bf404cac3.webp",
            address="ул. Пушкина, 10",
            status="error",
            issues_count=0,
        )

        db.add_all([p1, p2, p3, p4])
        db.commit()

        t1 = Task(
            photo_id=p1.id,
            description="Обновить разметку пешеходного перехода",
            address="ул. Ленина, 15",
            status="open",
        )
        t2 = Task(
            photo_id=p3.id,
            description="Окраска стоп-линии",
            address="ул. Пушкина, 10",
            status="completed",
        )
        t3 = Task(
            photo_id=p1.id,
            description="Жёстко заигнорить задание",
            address="ул. Ленина, 15",
            status="in_progress",
        )

        db.add_all([t1, t2, t3])
        db.commit()

        print("Демонстрационные данные успешно внесены в базу данных!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
