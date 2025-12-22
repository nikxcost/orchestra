import os
from typing import TypedDict, Literal, Optional
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
    "agent1": "тест 1 - Вы специалист по SQL-запросам и базам данных.",
    "agent2": "тест 2 - Вы специалист по сбору и анализу требований.",
    "agent3": "тест 3 - Вы специалист по технической документации.",
    "agent4": "тест 4 - Вы специалист по моделированию процессов.",
    "agent5": "тест 5 - Вы специалист по общему бизнес-анализу.",
}


def route_question(state: AgentState) -> AgentState:
    llm = get_llm()

    routing_prompt = f"""Вы оркестратор-маршрутизатор. Проанализируйте запрос пользователя и определите,
к какому из следующих агентов его направить:

- agent1: SQL-запросы и базы данных
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
    route = response.content.strip().lower()

    if route not in MINI_AGENTS_PROMPTS:
        route = "agent5"

    state["route"] = route
    state["context"] = f"Запрос направлен к {route}"

    return state


def mini_agent_node(agent_name: str):
    def node_function(state: AgentState) -> AgentState:
        llm = get_llm()

        system_prompt = MINI_AGENTS_PROMPTS[agent_name]
        user_query = state["input"]

        if state.get("revised_instructions"):
            user_query = f"{user_query}\n\nДополнительные инструкции: {state['revised_instructions']}"

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_query)
        ]

        response = llm.invoke(messages)
        state["agent_response"] = response.content
        state["context"] = f"{state.get('context', '')}\nОтвет получен от {agent_name}"

        return state

    return node_function


def review_result(state: AgentState) -> AgentState:
    llm = get_llm()

    max_iterations = 2
    if state.get("iteration_count", 0) >= max_iterations:
        state["review_result"] = "approved"
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

    state["context"] = f"{state.get('context', '')}\nРевью: {state['review_result']}"

    return state


def revise_task(state: AgentState) -> AgentState:
    state["iteration_count"] = state.get("iteration_count", 0) + 1
    state["context"] = f"{state.get('context', '')}\nИтерация доработки: {state['iteration_count']}"
    return state


def final_answer(state: AgentState) -> AgentState:
    state["context"] = f"{state.get('context', '')}\nФинальный ответ сформирован"
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
    }

    result = app.invoke(initial_state)

    return {
        "input": result["input"],
        "route": result.get("route"),
        "agent_response": result.get("agent_response"),
        "review_result": result.get("review_result"),
        "context": result.get("context"),
        "iteration_count": result.get("iteration_count", 0),
    }
