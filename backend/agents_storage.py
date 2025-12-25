"""
Хранилище для управления конфигурацией агентов.
Поддерживает CRUD операции с персистентностью в JSON файл.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from loguru import logger


class Agent:
    """Модель агента"""
    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        prompt: str,
        color: str = "bg-gray-500",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.description = description
        self.prompt = prompt
        self.color = color
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "prompt": self.prompt,
            "color": self.color,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'Agent':
        return cls(**data)


class AgentsStorage:
    """Хранилище агентов с персистентностью в JSON"""

    def __init__(self, file_path: str = "agents_config.json"):
        self.file_path = Path(file_path)
        self.agents: Dict[str, Agent] = {}
        self._load()

    def _load(self):
        """Загружает агентов из файла или создает дефолтную конфигурацию"""
        if self.file_path.exists():
            try:
                with open(self.file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.agents = {
                        agent_id: Agent.from_dict(agent_data)
                        for agent_id, agent_data in data.items()
                    }
                logger.info(f"Loaded {len(self.agents)} agents from {self.file_path}")
            except Exception as e:
                logger.warning(f"Error loading agents: {e}. Using default configuration.")
                self._create_default_agents()
        else:
            logger.info(f"File {self.file_path} not found. Creating default configuration.")
            self._create_default_agents()
            self._save()

    def _create_default_agents(self):
        """Создает дефолтную конфигурацию агентов"""
        self.agents = {
            "agent1": Agent(
                id="agent1",
                name="Агент вопросов",
                description="Генерация уточняющих вопросов для стейкхолдеров",
                color="bg-blue-500",
                prompt="""Ты — помощник бизнес-аналитика в продуктовой разработке.
Твоя задача — на основе текста, который тебе передаёт аналитик (например: описание задачи, инициатива, бизнес-проблема, draft требований), подготовить полный, приоритизированный и структурированный список вопросов, которые нужно задать стейкхолдерам, чтобы:
- Уточнить недостающую информацию.
- Снять противоречия и двусмысленности.
- Закрыть слепые зоны и возможные риски.
- Проверить корректность, полноту и реалистичность требований.
- Обеспечить соответствие требований критериям качества (ясность, полнота, проверяемость, непротиворечивость, однозначность, реализуемость).

Этап 1. Анализ входного текста
Перед формированием вопросов:
- Кратко опиши, как ты понял суть задачи (1–2 абзаца).
- Явно зафиксируй ключевые допущения, которые ты вынужден сделать из-за отсутствия информации.
- Укажи, какого типа инициатива описана во входном тексте (например: новая функциональность, доработка, оптимизация, исследование, регуляторное требование и т.п.).

Этап 2. Формирование вопросов
Сформируй список вопросов, структурированный по блокам, например:
- Бизнес-цели и ценность
- Пользователи и сценарии
- Функциональные требования
- Нефункциональные требования
- Ограничения и зависимости
- Риски и допущения
- Процессы и роли
- Метрики успеха

Для каждого блока:
- Перечисли конкретные вопросы, которые должен задать аналитик.
- Формулируй вопросы так, чтобы они были открытыми, уточняющими и стимулировали стейкхолдера раскрывать детали.
- Избегай наводящих вопросов и предположений о «правильном» ответе.
- Ограничь количество вопросов — 7–10 на блок, объединяя близкие по смыслу.

Приоритизируй вопросы
Для каждого вопроса укажи приоритет:
- P0 — без ответа на вопрос невозможно двигаться дальше.
- P1 — критично для корректной реализации и оценки сроков/стоимости.
- P2 — важно для оптимизации, но не блокирует старт.

Отдельный блок: Потенциальные противоречия и слепые зоны
Если во входном тексте есть:
- логические противоречия,
- размытые формулировки,
- конфликтующие цели или метрики,
- неявные риски или допущения,
выдели отдельный блок «Потенциальные противоречия и слепые зоны» и задай проясняющие вопросы, не предлагая решений и не подсказывая ожидаемый ответ.

Итоговое требование к ответу
Результат должен быть:
- структурированным,
- приоритизированным,
- ориентированным на реальный диалог со стейкхолдерами,
- пригодным для использования в discovery, refinement или защите требований."""
            ),
            "agent2": Agent(
                id="agent2",
                name="Агент требований",
                description="Специалист по сбору и анализу требований",
                color="bg-green-500",
                prompt="Вы специалист по сбору и анализу требований."
            ),
            "agent3": Agent(
                id="agent3",
                name="Агент документации",
                description="Специалист по технической документации",
                color="bg-yellow-500",
                prompt="Вы специалист по технической документации."
            ),
            "agent4": Agent(
                id="agent4",
                name="Агент моделирования",
                description="Специалист по моделированию процессов",
                color="bg-orange-500",
                prompt="Вы специалист по моделированию процессов."
            ),
            "agent5": Agent(
                id="agent5",
                name="Бизнес-аналитик",
                description="Специалист по общему бизнес-анализу",
                color="bg-red-500",
                prompt="Вы специалист по общему бизнес-анализу."
            )
        }

    def _save(self):
        """Сохраняет агентов в файл"""
        try:
            data = {
                agent_id: agent.to_dict()
                for agent_id, agent in self.agents.items()
            }
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            logger.debug(f"Saved {len(self.agents)} agents to {self.file_path}")
        except Exception as e:
            logger.error(f"Error saving agents: {e}")
            raise

    def get_all(self) -> List[dict]:
        """Возвращает список всех агентов"""
        return [agent.to_dict() for agent in self.agents.values()]

    def get_by_id(self, agent_id: str) -> Optional[dict]:
        """Возвращает агента по ID"""
        agent = self.agents.get(agent_id)
        return agent.to_dict() if agent else None

    def update(self, agent_id: str, name: str, description: str, prompt: str, color: str) -> dict:
        """Обновляет агента"""
        if agent_id not in self.agents:
            raise ValueError(f"Агент {agent_id} не найден")

        agent = self.agents[agent_id]
        agent.name = name
        agent.description = description
        agent.prompt = prompt
        agent.color = color
        agent.updated_at = datetime.now().isoformat()

        self._save()
        return agent.to_dict()

    def get_prompts_dict(self) -> Dict[str, str]:
        """Возвращает словарь промптов для использования в orchestrator"""
        return {
            agent_id: agent.prompt
            for agent_id, agent in self.agents.items()
        }

    def get_descriptions_dict(self) -> Dict[str, str]:
        """Возвращает словарь описаний агентов для routing"""
        return {
            agent_id: f"{agent.name} - {agent.description}"
            for agent_id, agent in self.agents.items()
        }


# Глобальный инстанс хранилища
_storage = None

def get_storage() -> AgentsStorage:
    """Возвращает singleton инстанс хранилища"""
    global _storage
    if _storage is None:
        _storage = AgentsStorage()
    return _storage
