# Multi-Agent Orchestrator Backend

Система оркестрации с использованием LangGraph и OpenRouter API.

## Архитектура

Система состоит из:
- **Оркестратор-маршрутизатор**: анализирует запрос и направляет к нужному агенту
- **5 мини-агентов**:
  - Agent 1: SQL и базы данных
  - Agent 2: Сбор и анализ требований
  - Agent 3: Техническая документация
  - Agent 4: Моделирование процессов
  - Agent 5: Общий бизнес-анализ
- **Ревьюер**: проверяет качество ответа
- **Система доработки**: отправляет на повторную обработку при необходимости

## Граф выполнения

```
Orchestrator -> Agent (1-5) -> Review -> [Final | Revise -> Agent -> Review -> ...]
```

## Установка

1. Установите зависимости:
```bash
cd backend
pip install -r requirements.txt
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Добавьте ваш API ключ OpenRouter в `.env`:
```
OPENROUTER_API_KEY=your_key_here
MODEL_NAME=openai/gpt-4o
```

## Запуск

```bash
python main.py
```

Или с uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /query
Обработка запроса через оркестратор.

**Request:**
```json
{
  "query": "Помогите написать SQL запрос для выборки пользователей"
}
```

**Response:**
```json
{
  "input": "Помогите написать SQL запрос для выборки пользователей",
  "route": "agent1",
  "agent_response": "Ответ агента...",
  "review_result": "approved",
  "context": "История обработки...",
  "iteration_count": 0
}
```

### GET /health
Проверка работоспособности API.

## Настройка агентов

Системные промпты агентов находятся в `orchestrator.py` в словаре `MINI_AGENTS_PROMPTS`.

Вы можете изменить промпты для настройки поведения агентов под ваши задачи.
