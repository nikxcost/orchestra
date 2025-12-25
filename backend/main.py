from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from orchestrator import process_query
from agents_storage import get_storage
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import traceback
from typing import List
import sys

# Настройка логирования
logger.remove()
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO"
)
logger.add(
    "logs/app.log",
    rotation="1 day",
    retention="7 days",
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
)

app = FastAPI(title="Multi-Agent Orchestrator API")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - в production укажите конкретные домены
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: В production заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description="User query")

    @validator('query')
    def query_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty or whitespace only')
        return v.strip()


class QueryResponse(BaseModel):
    input: str
    route: str
    agent_response: str
    review_result: str
    context: str
    iteration_count: int
    # Подробный лог выполнения пайплайна
    log: List[str]


class AgentUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Agent name")
    description: str = Field(..., min_length=1, max_length=500, description="Agent description")
    prompt: str = Field(..., min_length=10, max_length=10000, description="System prompt")
    color: str = Field(..., pattern=r'^bg-\w+-\d{3}$', description="Tailwind color class")

    @validator('name', 'description', 'prompt')
    def fields_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty or whitespace only')
        return v.strip()


@app.get("/")
async def root():
    return {
        "message": "Multi-Agent Orchestrator API",
        "endpoints": {
            "/query": "POST - Process a query through the orchestrator",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/agents")
async def get_agents():
    """Получить список всех агентов"""
    storage = get_storage()
    return storage.get_all()


@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Получить агента по ID"""
    storage = get_storage()
    agent = storage.get_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Агент {agent_id} не найден")
    return agent


@app.put("/agents/{agent_id}")
async def update_agent(agent_id: str, agent_update: AgentUpdate):
    """Обновить агента"""
    logger.info(f"Updating agent: {agent_id}")
    try:
        storage = get_storage()
        updated_agent = storage.update(
            agent_id=agent_id,
            name=agent_update.name,
            description=agent_update.description,
            prompt=agent_update.prompt,
            color=agent_update.color
        )
        logger.info(f"Agent {agent_id} updated successfully")
        return updated_agent
    except ValueError as e:
        logger.warning(f"Agent {agent_id} not found")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating agent {agent_id}: {str(e)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка обновления агента: {str(e)}")


@app.post("/query", response_model=QueryResponse)
@limiter.limit("10/minute")
async def query_orchestrator(request: QueryRequest):
    logger.info(f"Processing query: {request.query[:100]}...")
    try:
        result = await process_query(request.query)

        logger.info(f"Query processed successfully. Route: {result.get('route')}, Iterations: {result.get('iteration_count')}")

        return QueryResponse(
            input=result["input"],
            route=result.get("route", "unknown"),
            agent_response=result.get("agent_response", ""),
            review_result=result.get("review_result", ""),
            context=result.get("context", ""),
            iteration_count=result.get("iteration_count", 0),
            log=result.get("log", []),
        )

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        logger.debug(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
