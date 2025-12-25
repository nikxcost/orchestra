"""
Pytest configuration and shared fixtures
"""
import pytest
import os
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient


@pytest.fixture
def temp_config_file():
    """Создаёт временный JSON файл для тестов agents_storage"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        temp_path = f.name

    yield temp_path

    # Cleanup
    if os.path.exists(temp_path):
        os.unlink(temp_path)


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Мокаем переменные окружения для тестов"""
    monkeypatch.setenv("OPENROUTER_API_KEY", "test_api_key")
    monkeypatch.setenv("MODEL_NAME", "openai/gpt-4o")


@pytest.fixture
def test_client(mock_env_vars):
    """Создаёт тестовый клиент для FastAPI"""
    from main import app
    from httpx import ASGITransport
    from fastapi.testclient import TestClient as FastAPITestClient
    return FastAPITestClient(app)


@pytest.fixture
def sample_agent_data():
    """Примеры данных агентов для тестов"""
    return {
        "agent1": {
            "id": "agent1",
            "name": "Test Agent",
            "description": "Test description",
            "prompt": "Test prompt",
            "color": "bg-blue-500",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }
