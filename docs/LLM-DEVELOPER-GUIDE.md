# 🤖 LLM Developer Guide - Orchestra Project

> **SHOTGUN APPROACH**: Исчерпывающий справочник для быстрой навигации по проекту без избыточных поисков.
> Последнее обновление: 2025-12-26

---

## 📋 Содержание быстрого доступа

- [Quick Start](#quick-start)
- [Обзор проекта](#обзор-проекта)
- [Архитектура](#архитектура)
- [Структура файлов](#структура-файлов)
- [API Reference](#api-reference) (включая Swagger UI)
- [Типы данных](#типы-данных)
- [Workflow](#workflow)
- [Конфигурация](#конфигурация)
- [Быстрые команды](#быстрые-команды)

---

## ⚡ Quick Start

### Первоначальная настройка (5 минут)

```bash
# 1. Клонировать репозиторий (если нужно)
git clone <repository-url>
cd orchestra

# 2. Установить frontend зависимости
npm install

# 3. Установить backend зависимости
cd backend
pip install -r requirements.txt
cd ..

# 4. Настроить Backend Environment
cd backend
cp .env.example .env
nano .env  # Или любой редактор
```

**Заполнить `backend/.env`:**
```bash
# Получить на https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ

# Сгенерировать: python3 -c "import secrets; print(secrets.token_urlsafe(32))"
API_KEY=ваш-сгенерированный-ключ

# Модель (по умолчанию gpt-4o)
MODEL_NAME=openai/gpt-4o

# CORS для локальной разработки
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

```bash
# 5. Настроить Frontend Environment
cd ..
cp .env.example .env
nano .env
```

**Заполнить `.env` (frontend):**
```bash
# Для локальной разработки
VITE_API_BASE_URL=http://localhost:8000

# ВАЖНО: Тот же ключ, что и в backend/.env
VITE_API_KEY=ваш-сгенерированный-ключ
```

```bash
# 6. Запустить Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 7. В новом терминале: Запустить Frontend
npm run dev

# 8. Открыть в браузере
# http://localhost:5173
```

**Готово! 🎉** Можно отправлять запросы через UI.

### ✅ Чек-лист проверки установки

```bash
# ✓ Backend работает
curl http://localhost:8000/health
# Ожидается: {"status":"healthy"}

# ✓ Frontend открывается
# Открыть http://localhost:5173 в браузере

# ✓ API ключ настроен правильно
curl -H "X-API-Key: ваш-ключ" http://localhost:8000/agents
# Ожидается: JSON массив с агентами

# ✓ OpenRouter API работает
# Отправить тестовый запрос через UI, например: "Привет!"
# Ожидается: Ответ от одного из агентов
```

**Если что-то не работает →** См. [Debugging Tips](#debugging-tips)

### 🧪 Быстрое тестирование API

**Через Swagger UI (рекомендуется):**
1. Открыть [http://localhost:8000/docs](http://localhost:8000/docs)
2. Authorize с API ключом
3. Тестировать endpoints интерактивно

**Через curl:**
```bash
# Health check (без авторизации)
curl http://localhost:8000/health

# Получить список агентов
curl -H "X-API-Key: ваш-ключ" http://localhost:8000/agents

# Отправить запрос
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ваш-ключ" \
  -d '{"query": "Привет, как дела?"}'
```

---

## 🎯 Обзор проекта

**Orchestra** - Multi-Agent Orchestrator система с динамической маршрутизацией запросов через LLM агентов.

### Технологический стек
- **Frontend**: React 18.3 + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI + LangChain/LangGraph + OpenRouter API
- **Storage**: JSON-based agents configuration
- **Deploy**: Nginx + Systemd + VPS

### Ключевые возможности
1. Динамическая маршрутизация запросов к специализированным агентам
2. Автоматическая ревью и итеративная доработка ответов
3. CRUD операции для управления агентами через UI
4. История чатов с лимитом 50 записей
5. Dark/Light тема, адаптивный дизайн
6. Rate limiting (10 req/min) и API key аутентификация

---

## 🏗️ Архитектура

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTP/JSON
       │ X-API-Key header
┌──────▼──────┐
│   FastAPI   │ ← Rate Limiter (10/min)
│   Backend   │ ← CORS Middleware
└──────┬──────┘
       │
┌──────▼────────────────┐
│  Orchestrator         │
│  (LangGraph Workflow) │
├───────────────────────┤
│ 1. Route Question     │
│ 2. Mini Agent Node    │
│ 3. Review Result      │
│ 4. Revise (if needed) │
│ 5. Final Answer       │
└──────┬────────────────┘
       │
┌──────▼──────┐
│  OpenRouter │
│  API (GPT)  │
└─────────────┘
```

### Workflow детали

**Полный цикл обработки запроса:**
1. **orchestrator** → Маршрутизация к агенту (route_question)
2. **agent[1-5]** → Обработка запроса специализированным агентом (mini_agent_node)
3. **review** → Проверка качества ответа (review_result)
4. **revise** → Доработка (если review = "needs_revision")
5. **final** → Финальный ответ (после approval)

**Итерации:** Максимум 2 ревизии, затем принудительное одобрение.

---

## 📁 Структура файлов

### Backend (`/backend`)

```
backend/
├── main.py                 # FastAPI app, endpoints, CORS, rate limiting
├── orchestrator.py         # LangGraph workflow, routing, agents logic
├── agents_storage.py       # CRUD для агентов, JSON persistence
├── agents_config.json      # Конфигурация агентов (промпты, описания)
├── .env                    # OPENROUTER_API_KEY, MODEL_NAME, API_KEY
├── requirements.txt        # Python dependencies
├── tests/                  # Pytest tests
│   ├── test_api.py
│   ├── test_agents_storage.py
│   └── conftest.py
└── logs/                   # Логи приложения (rotation 7 days)
```

### Frontend (`/src`)

```
src/
├── App.tsx                 # Главный компонент, роутинг, state management
├── main.tsx                # Entry point, React mount
├── index.css               # Global styles, Tailwind imports
├── components/
│   ├── QueryForm.tsx       # Форма ввода запроса
│   ├── ResultDisplay.tsx   # Отображение результатов (markdown, logs)
│   ├── AgentCard.tsx       # Карточка агента в списке
│   ├── AgentEditModal.tsx  # Модальное окно редактирования агента
│   ├── SearchInput.tsx     # Поиск агентов
│   ├── CodeBlock.tsx       # Syntax highlighting для кода
│   ├── ThemeToggle.tsx     # Переключатель темы
│   ├── Toast.tsx           # Уведомления
│   └── Skeleton.tsx        # Loading placeholders
├── services/
│   └── api.ts              # API client (fetch wrappers)
├── types/
│   └── index.ts            # TypeScript типы
├── contexts/
│   └── ThemeContext.tsx    # Context для темы
├── config/
│   └── agents.ts           # Frontend конфиг агентов (fallback)
└── design/
    └── tokens.ts           # Design tokens
```

### Root Config

```
/
├── package.json            # Frontend dependencies, scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── nginx-orchestra.conf    # Nginx reverse proxy config
├── orchestra.service       # Systemd service config
├── .env                    # Frontend env vars (VITE_*)
└── docs/                   # Documentation
    ├── design-system.md
    ├── agent-editor.md
    ├── examples.md
    └── LLM-DEVELOPER-GUIDE.md  # ← Этот файл
```

---

## 🔌 API Reference

### Base URL
- **Development**: `http://localhost:8000`
- **Production**: `http://{server-ip}/api` (через Nginx)

### 📖 Swagger UI Documentation

FastAPI автоматически генерирует интерактивную документацию:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

**Преимущества Swagger UI:**
- ✅ Интерактивное тестирование всех endpoints
- ✅ Автоматическая валидация параметров
- ✅ Встроенная аутентификация (можно добавить X-API-Key header)
- ✅ Примеры request/response для каждого endpoint
- ✅ Автоматически обновляется при изменении кода

**Как использовать:**
1. Открыть [http://localhost:8000/docs](http://localhost:8000/docs)
2. Нажать "Authorize" в правом верхнем углу
3. Ввести API ключ в поле `X-API-Key`
4. Теперь можно тестировать все endpoints прямо из браузера!

### Authentication
Все эндпоинты (кроме `/` и `/health`) требуют заголовок:
```http
X-API-Key: {your-api-key}
```

**Генерация API ключа:**
```bash
# Сгенерировать безопасный случайный ключ
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Пример вывода:
# xK9vL2mP3nQ8rT4wU5yZ6aB7cD8eF9gH0iJ1kL2mN3oP
```

**Настройка:**
1. Сгенерировать ключ командой выше
2. Добавить в `backend/.env`:
   ```bash
   API_KEY=xK9vL2mP3nQ8rT4wU5yZ6aB7cD8eF9gH0iJ1kL2mN3oP
   ```
3. Добавить в `.env` (frontend):
   ```bash
   VITE_API_KEY=xK9vL2mP3nQ8rT4wU5yZ6aB7cD8eF9gH0iJ1kL2mN3oP
   ```
4. Перезапустить backend и пересобрать frontend

**Важно:** Ключи в `backend/.env` и `.env` должны **совпадать**!

### Endpoints

#### `GET /`
**Описание:** Информация об API
**Auth:** ❌ Не требуется
**Response:**
```json
{
  "message": "Multi-Agent Orchestrator API",
  "endpoints": { ... }
}
```

#### `GET /health`
**Описание:** Health check
**Auth:** ❌ Не требуется
**Response:**
```json
{ "status": "healthy" }
```

#### `POST /query`
**Описание:** Обработка запроса через orchestrator
**Auth:** ✅ Требуется X-API-Key
**Rate Limit:** 10 req/min per IP
**Request:**
```json
{
  "query": "Расскажи о React hooks"
}
```
**Response:**
```json
{
  "input": "Расскажи о React hooks",
  "route": "agent2",
  "agent_response": "...",
  "review_result": "approved",
  "context": "...",
  "iteration_count": 1,
  "log": ["▶️ Запрос получен", "🔹 Оркестратор: анализируем...", ...]
}
```

#### `GET /agents`
**Описание:** Получить список всех агентов
**Auth:** ✅ Требуется X-API-Key
**Response:**
```json
[
  {
    "id": "agent1",
    "name": "Философский агент",
    "description": "Отвечает на философские вопросы",
    "color": "bg-purple-500",
    "created_at": "2024-12-25T10:00:00",
    "updated_at": "2024-12-25T10:00:00"
  }
]
```

#### `GET /agents/{agent_id}`
**Описание:** Получить агента по ID с полным промптом
**Auth:** ✅ Требуется X-API-Key
**Response:**
```json
{
  "id": "agent1",
  "name": "Философский агент",
  "description": "Отвечает на философские вопросы",
  "prompt": "Вы философ с большим опытом...",
  "color": "bg-purple-500",
  "created_at": "2024-12-25T10:00:00",
  "updated_at": "2024-12-25T10:00:00"
}
```

#### `PUT /agents/{agent_id}`
**Описание:** Обновить агента
**Auth:** ✅ Требуется X-API-Key
**Request:**
```json
{
  "name": "Новое имя",
  "description": "Новое описание",
  "prompt": "Новый системный промпт...",
  "color": "bg-blue-500"
}
```
**Response:** Обновленный объект Agent

---

## 📊 Типы данных

### Frontend Types (`src/types/index.ts`)

```typescript
interface QueryRequest {
  query: string;
}

interface QueryResponse {
  input: string;
  route: string;
  agent_response: string;
  review_result: string;
  context: string;
  iteration_count: number;
  log: string[];
}

interface Agent {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface QueryHistoryItem {
  id: string;
  createdAt: string;
  request: string;
  response: QueryResponse;
}
```

### Backend Types

**AgentState** (LangGraph State):
```python
class AgentState(TypedDict):
    input: str
    route: Optional[str]
    agent_response: Optional[str]
    review_result: Optional[str]
    revised_instructions: Optional[str]
    context: Optional[str]
    iteration_count: int
    log: List[str]
```

**Agent Model** (agents_storage.py):
```python
class Agent:
    id: str
    name: str
    description: str
    prompt: str
    color: str
    created_at: str
    updated_at: str
```

---

## 🔄 Workflow

### LangGraph Pipeline

**Entry Point:** `orchestrator` node

**Nodes:**
1. `orchestrator` - Маршрутизация запроса
2. `agent1..agent5` - Специализированные агенты
3. `review` - Проверка качества ответа
4. `revise` - Счетчик итераций доработки
5. `final` - Финальная обработка

**Conditional Edges:**
- `orchestrator → agent[1-5]` (через route_to_agent)
- `review → revise | final` (через should_revise)
- `revise → agent[1-5]` (повторная обработка)

**Логика ревизии:**
```python
if review_result == "needs_revision" and iteration_count < 2:
    return "revise"
else:
    return "final"
```

### Agents Configuration

**Загрузка:** `agents_storage.py` → `agents_config.json`

**Динамическое обновление:** При каждом запросе агенты подгружаются из storage.

**Fallback:** Если route не найден → выбирается первый доступный агент.

---

## ⚙️ Конфигурация

### Backend Environment (`backend/.env`)

```bash
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxxxx
MODEL_NAME=openai/gpt-4o

# Security
API_KEY=your-secure-random-key-here

# CORS (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 🔑 Как получить ключи:

**OpenRouter API Key (для LLM):**
1. Зарегистрироваться на [openrouter.ai](https://openrouter.ai/)
2. Перейти в [Keys](https://openrouter.ai/keys)
3. Создать новый ключ → Скопировать
4. Добавить в `backend/.env`:
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-ваш-ключ-здесь
   ```

**API Key (для аутентификации Frontend ↔ Backend):**
```bash
# Генерация безопасного ключа
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Добавить ОДИН И ТОТ ЖЕ ключ в оба файла:
# backend/.env
API_KEY=сгенерированный-ключ

# .env (frontend root)
VITE_API_KEY=сгенерированный-ключ
```

**Модель (MODEL_NAME):**
- По умолчанию: `openai/gpt-4o`
- Другие варианты: `anthropic/claude-3.5-sonnet`, `google/gemini-pro`, etc.
- Список моделей: [openrouter.ai/models](https://openrouter.ai/models)

### Frontend Environment (`.env`)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_KEY=your-secure-random-key-here
```

### Nginx Configuration

**Location:** `/nginx-orchestra.conf`

**Key settings:**
- Reverse proxy `/api` → `http://localhost:8000`
- Reverse proxy `/` → `http://localhost:5173` (dev) или static files (prod)
- Headers: `X-Forwarded-For`, `X-Real-IP` для rate limiting

---

## 🚀 Быстрые команды

### Development

```bash
# Frontend
npm install
npm run dev              # Dev server (http://localhost:5173)
npm run build            # Production build → dist/
npm run typecheck        # TypeScript validation

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Tests
cd backend
pytest                   # Run all tests
pytest --cov             # With coverage
```

### Production Deploy

```bash
# Build frontend
npm run build

# Setup backend service
sudo cp orchestra.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable orchestra
sudo systemctl start orchestra

# Check status
sudo systemctl status orchestra
journalctl -u orchestra -f  # Live logs
```

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Systemd logs
journalctl -u orchestra -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔍 Частые задачи и где их решать

### Добавить нового агента

**Файл:** `backend/agents_config.json`

1. Добавить новый объект в массив agents:
```json
{
  "id": "agent6",
  "name": "Новый агент",
  "description": "Описание задач агента",
  "prompt": "Системный промпт для LLM",
  "color": "bg-green-500"
}
```

2. Обновить `orchestrator.py`:
   - Добавить `workflow.add_node("agent6", mini_agent_node("agent6"))`
   - Добавить "agent6" в conditional_edges

### Изменить UI компонента

**Где искать:**
- Форма запроса: `src/components/QueryForm.tsx`
- Результаты: `src/components/ResultDisplay.tsx`
- Карточки агентов: `src/components/AgentCard.tsx`
- Модалка редактирования: `src/components/AgentEditModal.tsx`

### Изменить стили/тему

**Файлы:**
- `tailwind.config.js` - Tailwind configuration, colors, theme
- `src/index.css` - Global styles
- `src/design/tokens.ts` - Design tokens
- `src/contexts/ThemeContext.tsx` - Theme logic

### Добавить новый API endpoint

**Файл:** `backend/main.py`

```python
@app.get("/new-endpoint", dependencies=[Depends(verify_api_key)])
async def new_endpoint():
    return {"data": "value"}
```

### Изменить логику маршрутизации

**Файл:** `backend/orchestrator.py`

**Функция:** `route_question(state: AgentState)`

### Изменить логику ревью

**Файл:** `backend/orchestrator.py`

**Функция:** `review_result(state: AgentState)`

### Обновить rate limit

**Файл:** `backend/main.py`

**Строка 186:**
```python
@limiter.limit("10/minute")  # ← Изменить здесь
```

---

## 🐛 Debugging Tips

### Backend не стартует

**Симптомы:** Backend падает при старте

**Диагностика:**
```bash
# Проверить логи
cd backend
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(f'OPENROUTER_API_KEY: {os.getenv(\"OPENROUTER_API_KEY\")[:20] if os.getenv(\"OPENROUTER_API_KEY\") else \"NOT SET\"}')"
```

**Решение:**
1. Убедиться что `backend/.env` существует
2. Проверить что OPENROUTER_API_KEY установлен и валиден
3. Проверить логи: `journalctl -u orchestra -f` (production) или stderr (dev)

### Frontend не подключается к backend

**Симптомы:** Network errors, CORS errors в консоли браузера

**Диагностика:**
```bash
# Проверить что backend работает
curl http://localhost:8000/health

# Проверить переменные окружения frontend
echo $VITE_API_BASE_URL
cat .env | grep VITE_API_BASE_URL
```

**Решение:**
1. Проверить `VITE_API_BASE_URL` в `.env` (должен быть `http://localhost:8000` для dev)
2. Проверить CORS в `backend/main.py` → `ALLOWED_ORIGINS` должен включать `http://localhost:5173`
3. Перезапустить `npm run dev` после изменения `.env`

### 401 Unauthorized

**Симптомы:** API возвращает 401 ошибку

**Причина:** API ключи не совпадают или не установлены

**Диагностика:**
```bash
# Проверить backend API key
cd backend
grep API_KEY .env

# Проверить frontend API key
cd ..
grep VITE_API_KEY .env

# Проверить что backend видит ключ
curl -H "X-API-Key: ваш-ключ" http://localhost:8000/agents
```

**Решение:**
1. Убедиться что `API_KEY` в `backend/.env` и `VITE_API_KEY` в `.env` **ИДЕНТИЧНЫ**
2. Если ключ не установлен - сгенерировать:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. Добавить в оба `.env` файла
4. Перезапустить backend и пересобрать frontend

### OpenRouter API ошибки (500 Internal Server Error)

**Симптомы:** Backend возвращает 500 при `/query`

**Причины:**
- Неверный OPENROUTER_API_KEY
- Недостаточно средств на аккаунте OpenRouter
- Неверная MODEL_NAME

**Диагностика:**
```bash
# Проверить ключ
cd backend
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('OPENROUTER_API_KEY'))"

# Проверить логи backend
tail -f logs/app.log
```

**Решение:**
1. Проверить баланс на [openrouter.ai](https://openrouter.ai/credits)
2. Проверить что ключ валиден на [openrouter.ai/keys](https://openrouter.ai/keys)
3. Попробовать другую модель (например `openai/gpt-3.5-turbo`)

### Rate Limit errors (429 Too Many Requests)

**Симптомы:** "Rate limit exceeded" ошибка

**Решение:**
1. Проверить настройки Nginx (X-Forwarded-For header)
2. Проверить функцию `get_real_ip()` в `main.py`
3. Увеличить лимит в `@limiter.limit("10/minute")` → `@limiter.limit("100/minute")`

### Frontend собирается, но пустая страница

**Причина:** Переменные окружения не встроились в production build

**Решение:**
```bash
# Проверить что .env существует ДО сборки
cat .env

# Пересобрать с правильными переменными
npm run build

# Проверить что переменные встроились
grep -r "VITE_API" dist/assets/*.js
```

---

## 📚 Дополнительная документация

- [Design System](design-system.md) - Компоненты, цвета, типография
- [Agent Editor](agent-editor.md) - Работа с редактором агентов
- [Examples](examples.md) - Примеры использования API
- [Mobile Fix](mobile-fix.md) - Адаптивность и мобильные фиксы
- [Production Improvements](production-improvements.md) - Production best practices

---

## 🔄 Обновление этого документа

**При изменениях в проекте обновляйте этот файл:**

1. Новый файл/модуль → Добавить в [Структура файлов](#структура-файлов)
2. Новый endpoint → Добавить в [API Reference](#api-reference)
3. Новая env переменная → Добавить в [Конфигурация](#конфигурация)
4. Изменение workflow → Обновить [Workflow](#workflow)
5. Новая частая задача → Добавить в [Частые задачи](#частые-задачи-и-где-их-решать)

**Дата последнего обновления:** 2025-12-26

---

## ✨ Quick Reference Card

| Задача | Файл | Функция/Место |
|--------|------|---------------|
| **Конфигурация** |
| Сгенерировать API ключ | CLI | `python3 -c "import secrets; print(secrets.token_urlsafe(32))"` |
| OpenRouter API ключ | [openrouter.ai/keys](https://openrouter.ai/keys) | Создать новый ключ |
| Backend env vars | `backend/.env` | OPENROUTER_API_KEY, API_KEY, MODEL_NAME |
| Frontend env vars | `.env` (root) | VITE_API_BASE_URL, VITE_API_KEY |
| CORS настройки | `backend/main.py` | ALLOWED_ORIGINS |
| **Разработка** |
| Добавить агента | `backend/agents_config.json` + `orchestrator.py` | JSON + workflow nodes |
| Изменить UI формы | `src/components/QueryForm.tsx` | Component |
| Новый API endpoint | `backend/main.py` | @app.get/post decorator |
| Изменить стили | `tailwind.config.js` или `src/index.css` | Config/CSS |
| Логика маршрутизации | `backend/orchestrator.py` | route_question() |
| Логика ревью | `backend/orchestrator.py` | review_result() |
| Rate limiting | `backend/main.py` | @limiter.limit("10/minute") |
| **Frontend** |
| API client | `src/services/api.ts` | Fetch functions |
| Типы данных | `src/types/index.ts` | TypeScript interfaces |
| История чатов | `src/App.tsx` | queryHistory state |
| Тема (dark/light) | `src/contexts/ThemeContext.tsx` | Context Provider |
| **Debugging & Testing** |
| Swagger UI | Browser | [http://localhost:8000/docs](http://localhost:8000/docs) |
| ReDoc | Browser | [http://localhost:8000/redoc](http://localhost:8000/redoc) |
| Backend логи | `backend/logs/app.log` | tail -f |
| Systemd логи | CLI | journalctl -u orchestra -f |
| Health check | CLI | curl http://localhost:8000/health |

---

**🎯 Цель этого документа:** Минимизировать время на поиск информации и исследование проекта для LLM агентов-разработчиков.

