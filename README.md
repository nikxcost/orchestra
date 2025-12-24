# Multi-Agent Orchestrator System

Интеллектуальная система оркестрации с использованием LangGraph и OpenRouter API для маршрутизации запросов к специализированным агентам.

## Архитектура

Система состоит из двух частей:

### Backend (Python + FastAPI + LangGraph)
- **Оркестратор-маршрутизатор**: анализирует запрос и определяет подходящего агента
- **5 специализированных мини-агентов**:
  1. Генерация уточняющих вопросов для стейкхолдеров
  2. Сбор и анализ требований
  3. Техническая документация
  4. Моделирование процессов
  5. Общий бизнес-анализ
- **Ревьюер**: проверяет качество ответа
- **Система доработки**: отправляет на повторную обработку при необходимости

### Frontend (React + TypeScript + Tailwind CSS)
- Интуитивный интерфейс для отправки запросов
- Визуализация активного агента
- Отображение статуса обработки
- История итераций доработки

## Граф выполнения

```
User Query
    ↓
Orchestrator (Route)
    ↓
Agent (1-5)
    ↓
Review
    ↓
[Approved] → Final Answer
    OR
[Needs Revision] → Revise → Agent (повтор) → Review → ...
```

## Установка и запуск

### 1. Установка зависимостей Backend

```bash
cd backend
pip install -r requirements.txt
```

### 2. Настройка OpenRouter API

Создайте файл `.env` в папке `backend`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и добавьте ваш API ключ:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL_NAME=openai/gpt-4o
```

Получить API ключ можно на [openrouter.ai](https://openrouter.ai/)

### 3. Запуск Backend

```bash
cd backend
python main.py
```

Backend будет доступен на `http://localhost:8000`

### 4. Установка зависимостей Frontend

```bash
npm install
```

### 5. Запуск Frontend

В отдельном терминале:

```bash
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

## Использование

1. Откройте фронтенд в браузере
2. Введите запрос в текстовое поле (или выберите один из примеров)
3. Нажмите "Отправить"
4. Наблюдайте за процессом:
   - Оркестратор выберет подходящего агента
   - Агент обработает запрос
   - Ревьюер проверит качество
   - При необходимости запрос будет отправлен на доработку
5. Получите финальный ответ

## API Endpoints

### POST /query
Обработка запроса через оркестратор

**Request:**
```json
{
  "query": "Помогите написать SQL запрос"
}
```

**Response:**
```json
{
  "input": "Помогите написать SQL запрос",
  "route": "agent1",
  "agent_response": "SELECT * FROM users WHERE active = true;",
  "review_result": "approved",
  "context": "История обработки...",
  "iteration_count": 0
}
```

### GET /health
Проверка работоспособности API

## Настройка агентов

Системные промпты агентов находятся в `backend/orchestrator.py` в словаре `MINI_AGENTS_PROMPTS`.

Вы можете изменить промпты для настройки поведения агентов:

```python
MINI_AGENTS_PROMPTS = {
    "agent1": "Ваш кастомный промпт для SQL агента...",
    "agent2": "Ваш кастомный промпт для агента требований...",
    # ...
}
```

## Технологии

**Backend:**
- Python 3.8+
- FastAPI
- LangGraph
- LangChain
- OpenRouter API

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide Icons

## Возможные улучшения

- Добавление истории запросов с использованием Supabase
- Поддержка стриминга ответов
- Визуализация графа выполнения в реальном времени
- Добавление метрик и аналитики
- Поддержка загрузки файлов для анализа
- Кастомизация агентов через UI

## Лицензия

MIT
