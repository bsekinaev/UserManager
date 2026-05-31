import pytest
import sys
from pathlib import Path
import tempfile
import os

# Добавляем корень проекта в path
root_dir = Path(__file__).parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))


@pytest.fixture(scope='function')
def app():
    """Создаёт тестовое приложение с изолированной БД"""
    from app import app as flask_app
    from database import init_db, get_database_path

    # Создаём временный файл для БД
    db_fd, db_path = tempfile.mkstemp(suffix='.db')

    flask_app.config['TESTING'] = True
    flask_app.config['DATABASE'] = db_path
    flask_app.config['WTF_CSRF_ENABLED'] = False

    with flask_app.app_context():
        init_db()
        yield flask_app

    # Очищаем временный файл после теста
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Тестовый клиент Flask"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """CLI runner для Flask"""
    return app.test_cli_runner()