# Примеры использования

## Примеры запросов для каждого агента

### Agent 1: Генерация уточняющих вопросов для стейкхолдеров

```
Сформируйте вопросы для стейкхолдера по задаче создания системы авторизации

Подготовьте список вопросов по требованиям к мобильному приложению для доставки еды

Создайте вопросы для уточнения требований к интеграции с внешней CRM системой
```

### Agent 2: Сбор и анализ требований

```
Помогите составить список требований для разработки мобильного приложения доставки еды

Проведите анализ бизнес-требований для CRM системы

Составьте техническое задание для интернет-магазина
```

### Agent 3: Техническая документация

```
Создайте документацию API для REST сервиса управления пользователями

Напишите руководство пользователя для веб-приложения бронирования

Создайте архитектурную документацию для микросервисной системы
```

### Agent 4: Моделирование процессов

```
Постройте BPMN диаграмму процесса обработки заказа в интернет-магазине

Создайте диаграмму последовательности для процесса авторизации пользователя

Разработайте модель процесса согласования документов
```

### Agent 5: Общий бизнес-анализ

```
Проведите SWOT анализ для запуска нового продукта

Помогите составить бизнес-план для стартапа

Проанализируйте конкурентную среду на рынке электронной коммерции
```

## Расширение системы

### Добавление нового агента

1. Откройте `backend/orchestrator.py`

2. Добавьте промпт для нового агента в словарь `MINI_AGENTS_PROMPTS`:

```python
MINI_AGENTS_PROMPTS = {
    "agent1": "Помощник бизнес-аналитика для генерации уточняющих вопросов стейкхолдерам.",
    "agent2": "тест 2 - Вы специалист по сбору и анализу требований.",
    "agent3": "тест 3 - Вы специалист по технической документации.",
    "agent4": "тест 4 - Вы специалист по моделированию процессов.",
    "agent5": "тест 5 - Вы специалист по общему бизнес-анализу.",
    "agent6": "Вы специалист по безопасности и тестированию.",  # Новый агент
}
```

3. Добавьте узел в граф в функции `create_workflow()`:

```python
workflow.add_node("agent6", mini_agent_node("agent6"))
```

4. Добавьте маршруты к новому агенту:

```python
workflow.add_conditional_edges(
    "orchestrator",
    route_to_agent,
    {
        "agent1": "agent1",
        "agent2": "agent2",
        "agent3": "agent3",
        "agent4": "agent4",
        "agent5": "agent5",
        "agent6": "agent6",  # Новый маршрут
    }
)

# И в revise:
workflow.add_conditional_edges(
    "revise",
    route_to_agent,
    {
        "agent1": "agent1",
        "agent2": "agent2",
        "agent3": "agent3",
        "agent4": "agent4",
        "agent5": "agent5",
        "agent6": "agent6",  # Новый маршрут
    }
)

# Не забудьте добавить переход к review:
workflow.add_edge("agent6", "review")
```

5. Обновите фронтенд - добавьте агента в `src/config/agents.ts`:

```typescript
export const AGENTS: Agent[] = [
  // ... существующие агенты
  {
    id: 'agent6',
    name: 'Агент безопасности',
    description: 'Специалист по безопасности и тестированию',
    color: 'bg-purple-500',
  },
];
```

### Настройка ревьюера

Логика ревьюера находится в функции `review_result()` в `backend/orchestrator.py`.

Вы можете изменить:

1. **Количество итераций доработки**:
```python
max_iterations = 2  # Измените на нужное число
```

2. **Критерии оценки**:
Измените промпт в переменной `review_prompt` для настройки критериев оценки.

3. **Формат ответа**:
Текущий формат: `<статус>|<комментарий>`
Вы можете использовать JSON или другой формат.

### Добавление инструментов для агентов

Для добавления инструментов (tools) агентам:

1. Создайте функции-инструменты:

```python
from langchain.tools import tool

@tool
def search_database(query: str) -> str:
    """Поиск в базе данных"""
    # Ваша логика
    return "Результаты поиска..."

@tool
def generate_diagram(description: str) -> str:
    """Генерация диаграммы"""
    # Ваша логика
    return "Диаграмма сгенерирована..."
```

2. Модифицируйте функцию `mini_agent_node()` для использования агентов с инструментами:

```python
from langchain.agents import create_openai_functions_agent, AgentExecutor

def mini_agent_with_tools(agent_name: str, tools: list):
    def node_function(state: AgentState) -> AgentState:
        llm = get_llm()

        agent = create_openai_functions_agent(llm, tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=tools)

        result = agent_executor.invoke({"input": state["input"]})
        state["agent_response"] = result["output"]

        return state

    return node_function
```

### Добавление истории разговоров

Для добавления памяти:

1. Установите зависимость:
```bash
pip install langchain-community
```

2. Модифицируйте `AgentState`:

```python
class AgentState(TypedDict):
    input: str
    route: Optional[str]
    agent_response: Optional[str]
    review_result: Optional[str]
    revised_instructions: Optional[str]
    context: Optional[str]
    iteration_count: int
    chat_history: Optional[list]  # Новое поле
```

3. Используйте историю в узлах агентов:

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(return_messages=True)

def mini_agent_node(agent_name: str):
    def node_function(state: AgentState) -> AgentState:
        # Добавьте историю в контекст
        history = state.get("chat_history", [])
        # ... используйте историю в промпте

        return state

    return node_function
```

## Интеграция с внешними сервисами

### Добавление веб-поиска

```python
from langchain.tools import DuckDuckGoSearchRun

search = DuckDuckGoSearchRun()

# Используйте в агенте
tools = [search]
```

### Добавление доступа к документам

```python
from langchain.document_loaders import TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS

# Загрузка документов
loader = TextLoader("docs.txt")
documents = loader.load()

# Создание векторного хранилища
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents, embeddings)

# Использование для поиска
retriever = vectorstore.as_retriever()
```

## Мониторинг и логирование

Добавьте логирование для отслеживания работы системы:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def route_question(state: AgentState) -> AgentState:
    logger.info(f"Routing query: {state['input']}")
    # ... логика
    logger.info(f"Selected agent: {state['route']}")
    return state
```

## Оптимизация производительности

### Кэширование ответов

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def cached_llm_call(prompt: str) -> str:
    # Ваш вызов LLM
    pass
```

### Параллельная обработка

Для обработки нескольких запросов одновременно используйте async:

```python
import asyncio

async def process_multiple_queries(queries: list[str]):
    tasks = [process_query(q) for q in queries]
    results = await asyncio.gather(*tasks)
    return results
```
