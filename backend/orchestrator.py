import os
from typing import TypedDict, Literal, Optional, List
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

load_dotenv()


class AgentState(TypedDict):
    input: str
    route: Optional[str]
    agent_response: Optional[str]
    review_result: Optional[str]
    revised_instructions: Optional[str]
    context: Optional[str]
    iteration_count: int
    # Подробные человекочитаемые шаги выполнения пайплайна
    log: List[str]


def get_llm():
    """
    Создаём LLM-клиент для OpenRouter с учётом новой архитектуры langchain-openai.

    В актуальных версиях используются аргументы api_key / base_url / model,
    а не openai_api_key / openai_api_base / model_name.
    """

    return ChatOpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        model=os.getenv("MODEL_NAME", "openai/gpt-4o"),
        temperature=0.7,
    )


MINI_AGENTS_PROMPTS = {
    "agent1": """Ты — помощник бизнес-аналитика в продуктовой разработке.
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
- пригодным для использования в discovery, refinement или защите требований.""",
    "agent2": "тест 2 - Вы специалист по сбору и анализу требований.",
    "agent3": "тест 3 - Вы специалист по технической документации.",
    "agent4": "тест 4 - Вы специалист по моделированию процессов.",
    "agent5": "тест 5 - Вы специалист по общему бизнес-анализу.",
}


def route_question(state: AgentState) -> AgentState:
    state.setdefault("log", [])
    state["log"].append(
        "🔹 Оркестратор: анализируем запрос и выбираем агента...\n"
        f"   Входной запрос пользователя:\n"
        f"   {state['input']}"
    )

    llm = get_llm()

    routing_prompt = f"""Вы оркестратор-маршрутизатор. Проанализируйте запрос пользователя и определите,
к какому из следующих агентов его направить:

- agent1: Генерация уточняющих вопросов для стейкхолдеров (для уточнения требований, описаний задач, инициатив)
- agent2: Сбор и анализ требований
- agent3: Техническая документация
- agent4: Моделирование процессов
- agent5: Общий бизнес-анализ

Запрос пользователя: {state["input"]}

Ответьте только названием агента (agent1, agent2, agent3, agent4 или agent5) без дополнительных пояснений."""

    messages = [
        SystemMessage(content="Вы оркестратор-маршрутизатор запросов."),
        HumanMessage(content=routing_prompt)
    ]

    response = llm.invoke(messages)
    raw_route = response.content.strip()
    route = raw_route.lower()

    if route not in MINI_AGENTS_PROMPTS:
        route = "agent5"

    state["route"] = route
    state["context"] = f"Запрос направлен к {route}"
    state["log"].append(
        "✅ Оркестратор: принял решение о маршрутизации\n"
        f"   Ответ LLM (сырое значение): {raw_route}\n"
        f"   Выбранный агент: {route}"
    )

    return state


def mini_agent_node(agent_name: str):
    def node_function(state: AgentState) -> AgentState:
        state.setdefault("log", [])
        state["log"].append(
            f"🔹 Агент {agent_name}: получен запрос на обработку\n"
            f"   Системный промпт:\n"
            f"   {MINI_AGENTS_PROMPTS[agent_name]}\n"
            f"   Запрос пользователя (c учётом доработок, если есть):"
        )

        llm = get_llm()

        system_prompt = MINI_AGENTS_PROMPTS[agent_name]
        user_query = state["input"]

        if state.get("revised_instructions"):
            user_query = f"{user_query}\n\nДополнительные инструкции от ревьюера: {state['revised_instructions']}"

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_query)
        ]

        state["log"].append(f"   Итоговый текст, отправленный агенту:\n{user_query}")

        response = llm.invoke(messages)
        state["agent_response"] = response.content
        state["context"] = f"{state.get('context', '')}\nОтвет получен от {agent_name}"
        state["log"].append(
            f"✅ Агент {agent_name}: сформировал ответ\n"
            f"   Ответ агента:\n"
            f"   {state['agent_response']}"
        )

        return state

    return node_function


def review_result(state: AgentState) -> AgentState:
    state.setdefault("log", [])
    state["log"].append(
        "🔹 Ревьюер: проверяем качество ответа агента\n"
        f"   Запрос пользователя:\n"
        f"   {state['input']}\n"
        "   Ответ агента для проверки:\n"
        f"   {state.get('agent_response', '')}"
    )

    llm = get_llm()

    max_iterations = 2
    if state.get("iteration_count", 0) >= max_iterations:
        state["review_result"] = "approved"
        state["log"].append("ℹ️ Достигнут лимит итераций, ответ принудительно одобрен")
        return state

    review_prompt = f"""Вы ревьюер. Проверьте ответ агента на соответствие запросу пользователя.

Запрос пользователя: {state["input"]}

Ответ агента: {state["agent_response"]}

Оцените ответ:
- Если ответ полный, правильный и соответствует запросу, ответьте "approved"
- Если ответ требует доработки, ответьте "needs_revision" и кратко опишите, что нужно исправить

Формат ответа: <статус>|<комментарий если нужна доработка>"""

    messages = [
        SystemMessage(content="Вы ревьюер ответов агентов."),
        HumanMessage(content=review_prompt)
    ]

    response = llm.invoke(messages)
    result_parts = response.content.strip().split("|", 1)

    state["review_result"] = result_parts[0].strip().lower()

    if state["review_result"] == "needs_revision" and len(result_parts) > 1:
        state["revised_instructions"] = result_parts[1].strip()
        state["log"].append(
            f"⚠️ Ревьюер: требуется доработка — {state['revised_instructions']}"
        )
    else:
        state["log"].append("✅ Ревьюер: ответ одобрен")

    state["context"] = f"{state.get('context', '')}\nРевью: {state['review_result']}"

    return state


def revise_task(state: AgentState) -> AgentState:
    state["iteration_count"] = state.get("iteration_count", 0) + 1
    state["context"] = f"{state.get('context', '')}\nИтерация доработки: {state['iteration_count']}"
    state.setdefault("log", [])
    state["log"].append(f"🔁 Итерация доработки: #{state['iteration_count']}")
    return state


def final_answer(state: AgentState) -> AgentState:
    state.setdefault("log", [])
    state["log"].append("🏁 Финальный ответ сформирован и готов к отправке пользователю")
    # Дублируем полный путь запроса в context, чтобы его можно было увидеть как сырой текст
    state["context"] = "\n".join(state["log"])
    return state


def should_revise(state: AgentState) -> Literal["revise", "final"]:
    if state.get("review_result") == "needs_revision":
        return "revise"
    return "final"


def route_to_agent(state: AgentState) -> str:
    return state.get("route", "agent5")


def create_workflow():
    workflow = StateGraph(AgentState)

    workflow.add_node("orchestrator", route_question)
    workflow.add_node("agent1", mini_agent_node("agent1"))
    workflow.add_node("agent2", mini_agent_node("agent2"))
    workflow.add_node("agent3", mini_agent_node("agent3"))
    workflow.add_node("agent4", mini_agent_node("agent4"))
    workflow.add_node("agent5", mini_agent_node("agent5"))
    workflow.add_node("review", review_result)
    workflow.add_node("revise", revise_task)
    workflow.add_node("final", final_answer)

    workflow.set_entry_point("orchestrator")

    workflow.add_conditional_edges(
        "orchestrator",
        route_to_agent,
        {
            "agent1": "agent1",
            "agent2": "agent2",
            "agent3": "agent3",
            "agent4": "agent4",
            "agent5": "agent5",
        }
    )

    for agent in ["agent1", "agent2", "agent3", "agent4", "agent5"]:
        workflow.add_edge(agent, "review")

    workflow.add_conditional_edges(
        "review",
        should_revise,
        {
            "revise": "revise",
            "final": "final"
        }
    )

    workflow.add_conditional_edges(
        "revise",
        route_to_agent,
        {
            "agent1": "agent1",
            "agent2": "agent2",
            "agent3": "agent3",
            "agent4": "agent4",
            "agent5": "agent5",
        }
    )

    workflow.add_edge("final", END)

    return workflow.compile()


async def process_query(user_input: str) -> dict:
    app = create_workflow()

    initial_state: AgentState = {
        "input": user_input,
        "route": None,
        "agent_response": None,
        "review_result": None,
        "revised_instructions": None,
        "context": "",
        "iteration_count": 0,
        "log": ["▶️ Запрос получен от пользователя"],
    }

    result = app.invoke(initial_state)

    return {
        "input": result["input"],
        "route": result.get("route"),
        "agent_response": result.get("agent_response"),
        "review_result": result.get("review_result"),
        "context": result.get("context"),
        "iteration_count": result.get("iteration_count", 0),
        "log": result.get("log", []),
    }
