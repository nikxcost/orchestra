# Testing Guide

## Запуск тестов

### Установка зависимостей для тестирования

```bash
cd backend
pip install -r requirements.txt
```

### Запуск всех тестов

```bash
pytest
```

### Запуск с покрытием кода

```bash
pytest --cov=. --cov-report=html
```

Отчёт будет сохранён в `htmlcov/index.html`

### Запуск конкретного теста

```bash
# Запустить тесты для agents_storage
pytest tests/test_agents_storage.py

# Запустить конкретный тестовый класс
pytest tests/test_agents_storage.py::TestAgent

# Запустить конкретный тест
pytest tests/test_agents_storage.py::TestAgent::test_agent_creation
```

### Запуск с подробным выводом

```bash
pytest -v
```

### Запуск с отображением print statements

```bash
pytest -s
```

## Структура тестов

```
backend/
  tests/
    __init__.py
    conftest.py           # Фикстуры и общая конфигурация
    test_agents_storage.py  # Тесты для agents_storage
    test_api.py           # Тесты для FastAPI endpoints
```

## Покрытие кода

Текущее покрытие должно быть выше 60%.

Для просмотра покрытия:
```bash
pytest --cov=. --cov-report=term-missing
```

## Continuous Integration

TODO: Добавить GitHub Actions для автоматического запуска тестов при push.

## Написание новых тестов

1. Создайте файл `test_<module>.py` в папке `tests/`
2. Используйте фикстуры из `conftest.py`
3. Следуйте паттерну Arrange-Act-Assert
4. Добавляйте docstrings к тестовым функциям

Пример:

```python
def test_my_feature(test_client):
    """Тест новой функциональности"""
    # Arrange
    data = {"key": "value"}

    # Act
    response = test_client.post("/endpoint", json=data)

    # Assert
    assert response.status_code == 200
    assert response.json()["result"] == "expected"
```
