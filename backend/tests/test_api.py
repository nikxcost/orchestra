"""
Тесты для FastAPI endpoints
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock


class TestHealthEndpoint:
    """Тесты для health check endpoint"""

    def test_health_check(self, test_client):
        """Тест health check endpoint"""
        response = test_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestAgentsEndpoints:
    """Тесты для endpoints управления агентами"""

    def test_get_all_agents(self, test_client):
        """Тест получения списка всех агентов"""
        response = test_client.get("/agents")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        assert all("id" in agent for agent in data)
        assert all("name" in agent for agent in data)

    def test_get_agent_by_id(self, test_client):
        """Тест получения агента по ID"""
        response = test_client.get("/agents/agent1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "agent1"
        assert "name" in data
        assert "prompt" in data
        assert "description" in data

    def test_get_nonexistent_agent(self, test_client):
        """Тест получения несуществующего агента"""
        response = test_client.get("/agents/nonexistent")

        assert response.status_code == 404
        assert "не найден" in response.json()["detail"]

    def test_update_agent(self, test_client):
        """Тест обновления агента"""
        update_data = {
            "name": "Updated Agent",
            "description": "Updated description",
            "prompt": "Updated prompt",
            "color": "bg-purple-500"
        }

        response = test_client.put("/agents/agent1", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Agent"
        assert data["description"] == "Updated description"
        assert data["prompt"] == "Updated prompt"
        assert data["color"] == "bg-purple-500"

    def test_update_nonexistent_agent(self, test_client):
        """Тест обновления несуществующего агента"""
        update_data = {
            "name": "Test",
            "description": "Test",
            "prompt": "Test",
            "color": "bg-blue-500"
        }

        response = test_client.put("/agents/nonexistent", json=update_data)

        assert response.status_code == 404


class TestQueryEndpoint:
    """Тесты для endpoint обработки запросов"""

    @patch('main.process_query')
    async def test_query_with_valid_input(self, mock_process_query, test_client):
        """Тест обработки валидного запроса"""
        # Мокаем ответ от process_query
        mock_process_query.return_value = {
            "input": "test query",
            "route": "agent1",
            "agent_response": "test response",
            "review_result": "approved",
            "context": "test context",
            "iteration_count": 1,
            "log": ["test log"]
        }

        response = test_client.post("/query", json={"query": "test query"})

        assert response.status_code == 200
        data = response.json()
        assert data["input"] == "test query"
        assert data["route"] == "agent1"
        assert data["agent_response"] == "test response"

    def test_query_with_empty_input(self, test_client):
        """Тест с пустым запросом"""
        response = test_client.post("/query", json={"query": ""})

        assert response.status_code == 400
        assert "cannot be empty" in response.json()["detail"].lower()

    def test_query_with_whitespace_only(self, test_client):
        """Тест с запросом из одних пробелов"""
        response = test_client.post("/query", json={"query": "   "})

        assert response.status_code == 400

    def test_query_without_query_field(self, test_client):
        """Тест без поля query"""
        response = test_client.post("/query", json={})

        assert response.status_code == 422  # Validation error


class TestRootEndpoint:
    """Тесты для корневого endpoint"""

    def test_root_endpoint(self, test_client):
        """Тест корневого endpoint"""
        response = test_client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "endpoints" in data
        assert "/query" in data["endpoints"]
        assert "/health" in data["endpoints"]


class TestCORS:
    """Тесты для CORS настроек"""

    def test_cors_headers_present(self, test_client):
        """Проверка наличия CORS headers"""
        response = test_client.options(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )

        # CORS middleware должен добавлять заголовки
        assert "access-control-allow-origin" in response.headers
