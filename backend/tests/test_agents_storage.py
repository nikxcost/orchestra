"""
Тесты для модуля agents_storage
"""
import pytest
import json
from agents_storage import Agent, AgentsStorage


class TestAgent:
    """Тесты для класса Agent"""

    def test_agent_creation(self):
        """Тест создания агента"""
        agent = Agent(
            id="test1",
            name="Test Agent",
            description="Test description",
            prompt="Test prompt",
            color="bg-blue-500"
        )

        assert agent.id == "test1"
        assert agent.name == "Test Agent"
        assert agent.description == "Test description"
        assert agent.prompt == "Test prompt"
        assert agent.color == "bg-blue-500"
        assert agent.created_at is not None
        assert agent.updated_at is not None

    def test_agent_to_dict(self):
        """Тест сериализации агента в словарь"""
        agent = Agent(
            id="test1",
            name="Test Agent",
            description="Test description",
            prompt="Test prompt"
        )

        data = agent.to_dict()

        assert data["id"] == "test1"
        assert data["name"] == "Test Agent"
        assert "created_at" in data
        assert "updated_at" in data

    def test_agent_from_dict(self):
        """Тест десериализации агента из словаря"""
        data = {
            "id": "test1",
            "name": "Test Agent",
            "description": "Test description",
            "prompt": "Test prompt",
            "color": "bg-blue-500",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }

        agent = Agent.from_dict(data)

        assert agent.id == "test1"
        assert agent.name == "Test Agent"
        assert agent.created_at == "2024-01-01T00:00:00"


class TestAgentsStorage:
    """Тесты для класса AgentsStorage"""

    def test_storage_initialization_with_nonexistent_file(self, temp_config_file):
        """Тест инициализации хранилища с несуществующим файлом"""
        storage = AgentsStorage(temp_config_file)

        # Должно создать дефолтных агентов
        assert len(storage.agents) == 5
        assert "agent1" in storage.agents
        assert "agent5" in storage.agents

    def test_storage_load_from_file(self, temp_config_file, sample_agent_data):
        """Тест загрузки агентов из файла"""
        # Записываем тестовые данные
        with open(temp_config_file, 'w', encoding='utf-8') as f:
            json.dump(sample_agent_data, f)

        storage = AgentsStorage(temp_config_file)

        assert len(storage.agents) == 1
        assert storage.agents["agent1"].name == "Test Agent"

    def test_get_all_agents(self, temp_config_file):
        """Тест получения всех агентов"""
        storage = AgentsStorage(temp_config_file)
        agents = storage.get_all()

        assert isinstance(agents, list)
        assert len(agents) == 5
        assert all(isinstance(agent, dict) for agent in agents)

    def test_get_agent_by_id(self, temp_config_file):
        """Тест получения агента по ID"""
        storage = AgentsStorage(temp_config_file)
        agent = storage.get_by_id("agent1")

        assert agent is not None
        assert agent["id"] == "agent1"
        assert "name" in agent
        assert "prompt" in agent

    def test_get_nonexistent_agent(self, temp_config_file):
        """Тест получения несуществующего агента"""
        storage = AgentsStorage(temp_config_file)
        agent = storage.get_by_id("nonexistent")

        assert agent is None

    def test_update_agent(self, temp_config_file):
        """Тест обновления агента"""
        storage = AgentsStorage(temp_config_file)

        updated = storage.update(
            agent_id="agent1",
            name="Updated Name",
            description="Updated Description",
            prompt="Updated Prompt",
            color="bg-red-500"
        )

        assert updated["name"] == "Updated Name"
        assert updated["description"] == "Updated Description"
        assert updated["prompt"] == "Updated Prompt"
        assert updated["color"] == "bg-red-500"

        # Проверяем, что изменения сохранились
        agent = storage.get_by_id("agent1")
        assert agent["name"] == "Updated Name"

    def test_update_nonexistent_agent(self, temp_config_file):
        """Тест обновления несуществующего агента"""
        storage = AgentsStorage(temp_config_file)

        with pytest.raises(ValueError, match="не найден"):
            storage.update(
                agent_id="nonexistent",
                name="Name",
                description="Desc",
                prompt="Prompt",
                color="bg-blue-500"
            )

    def test_get_prompts_dict(self, temp_config_file):
        """Тест получения словаря промптов"""
        storage = AgentsStorage(temp_config_file)
        prompts = storage.get_prompts_dict()

        assert isinstance(prompts, dict)
        assert len(prompts) == 5
        assert "agent1" in prompts
        assert isinstance(prompts["agent1"], str)

    def test_get_descriptions_dict(self, temp_config_file):
        """Тест получения словаря описаний"""
        storage = AgentsStorage(temp_config_file)
        descriptions = storage.get_descriptions_dict()

        assert isinstance(descriptions, dict)
        assert len(descriptions) == 5
        assert "agent1" in descriptions
        assert " - " in descriptions["agent1"]  # Формат: "Name - Description"

    def test_storage_persistence(self, temp_config_file):
        """Тест персистентности данных"""
        # Создаём первое хранилище и обновляем агента
        storage1 = AgentsStorage(temp_config_file)
        storage1.update(
            agent_id="agent1",
            name="Persistent Name",
            description="Persistent Description",
            prompt="Persistent Prompt",
            color="bg-green-500"
        )

        # Создаём второе хранилище из того же файла
        storage2 = AgentsStorage(temp_config_file)
        agent = storage2.get_by_id("agent1")

        # Проверяем, что изменения сохранились
        assert agent["name"] == "Persistent Name"
        assert agent["description"] == "Persistent Description"
