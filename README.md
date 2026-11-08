# 👥 UserManager — учебное CRUD-приложение на Flask

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![CI/CD](https://github.com/bsekinaev/UserManager/actions/workflows/ci.yml/badge.svg)](https://github.com/bsekinaev/UserManager/actions)
[![Release](https://img.shields.io/github/v/release/bsekinaev/UserManager?label=release&color=blue)](https://github.com/bsekinaev/UserManager/releases/tag/v2.0.0)

> 📋 **Контекст:** Данное решение выполнено для отбора на стажировку по задаче для **Fullstack-разработчиков от Digital агентства «Победа»** (программа «Нетология.Лаборатория практики»).  
> Проект демонстрирует работу с REST API, SQLite, валидацией данных, Docker, автоматическими тестами и GitHub Actions.
>
> **Статус:** тестовое задание; подтверждённое промышленное внедрение отсутствует. API не имеет аутентификации и не предназначен для размещения в публичном интернете без дополнительных мер защиты.

## ✨ Функциональность

### ✅ Выполнено согласно заданию
- REST API на Flask: `GET /users`, `GET /users/<id>`
- Хранение данных в SQLite
- Базовая обработка ошибок (404, 500)
- Frontend на Vanilla JS + Bootstrap 5: отображение таблицы, модальное окно с деталями

### 🚀 Реализовано сверх требований
- Полный CRUD (Create, Read, Update, Delete) с подтверждением удаления
- Поиск в реальном времени по имени/email + сортировка (по дате, алфавиту)
- Двухуровневая валидация (клиент + сервер) с подсветкой ошибок
- AJAX-обновления без перезагрузки страницы
- Параметризованные SQL-запросы и экранирование HTML в реализованных сценариях интерфейса

### 🛠 Инфраструктура и качество кода
- 🐳 **Docker & Docker Compose**: готовое окружение для разработки и тестирования
- 🧪 **Pytest**: автоматизированные тесты API; актуальное покрытие необходимо проверять по свежему отчёту
- 🔄 **GitHub Actions**: автозапуск тестов при каждом push/PR
- ⚙️ **Docker**: Gunicorn и запуск от непривилегированного пользователя в Dockerfile; готовность к промышленной эксплуатации не заявляется
- 📝 **Расширенная документация** и примеры запуска

## 🛠 Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Backend** | Python 3.9+, Flask 2.3.3, SQLite3, Gunicorn |
| **Frontend** | Vanilla JS (ES6+), Bootstrap 5, Fetch API, HTML5/CSS3 |
| **DevOps** | Docker, Docker Compose, GitHub Actions, pytest, coverage |
| **Безопасность** | Параметризованные SQL-запросы, экранирование HTML, валидация regex |

## 🚀 Быстрый старт

### 🐳 Через Docker (рекомендуется)
```bash
# Клонировать и запустить приложение
git clone https://github.com/bsekinaev/UserManager.git
cd UserManager
docker-compose up -d --build

# Приложение доступно: http://localhost:5000
```

### 💻 Локальная разработка (без Docker)
```bash
git clone https://github.com/bsekinaev/UserManager.git
cd UserManager

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt
python app.py              # http://localhost:5000
```

## 🧪 Тестирование

Проект покрыт изолированными тестами с использованием временных БД. Запуск возможен как локально, так и в контейнере.

```bash
# Локально
python -m pytest tests/test_api.py -v --cov=app --cov=database --cov-report=term-missing

# В Docker
docker-compose --profile test up --build --exit-code-from test
```
*Бейдж CI отражает статус workflow, а не процент покрытия. Тесты запускаются GitHub Actions для push в `main`/`develop` и pull request в `main`.*

## 📡 API Endpoints

| Метод | Endpoint | Описание | Коды ответа |
|-------|----------|----------|-------------|
| `GET` | `/users` | Список всех пользователей | `200`, `500` |
| `GET` | `/users/<id>` | Данные пользователя по ID | `200`, `404`, `500` |
| `POST` | `/users` | Создание нового пользователя | `201`, `400`, `500` |
| `PUT` | `/users/<id>` | Обновление данных | `200`, `400`, `404`, `500` |
| `DELETE` | `/users/<id>` | Удаление пользователя | `200`, `404`, `500` |

## 🔒 Безопасность и ограничения
- SQL-запросы используют параметры (`?`); в интерфейсе предусмотрено экранирование HTML через `escapeHtml`.
- Поля имени и email проверяются на клиенте и сервере; эти проверки не заменяют полноценный аудит безопасности.
- API не проверяет личность пользователя и не разграничивает права доступа: не выставляйте сервис в публичную сеть без доработки аутентификации и авторизации.
- Dockerfile запускает Gunicorn от пользователя `appuser`, однако локальный `python app.py` включает отладочный режим Flask и предназначен только для разработки.
- В Dockerfile healthcheck вызывает `curl`; перед использованием нужно удостовериться, что утилита установлена в образе и healthcheck действительно проходит.
- Защита от атак, устойчивость под нагрузкой и готовность к production не подтверждены отдельной приёмкой.

## 📸 Скриншоты
![Главная страница](screen/main.png)

## 👨‍💻 Автор
**Батраз Секинаев** | Python Backend Developer  
📍 Ставрополь, Россия | 🌍 Открыт к удалённой работе  
📱 Telegram: [@bsekinaev](https://t.me/bsekinaev) | ✉️ Email: bsekinaev@ya.ru  
💼 Портфолио: [github.com/bsekinaev](https://github.com/bsekinaev)
