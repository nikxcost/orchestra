from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from orchestrator import process_query
import traceback
from typing import List

app = FastAPI(title="Multi-Agent Orchestrator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    input: str
    route: str
    agent_response: str
    review_result: str
    context: str
    iteration_count: int
    # Подробный лог выполнения пайплайна
    log: List[str]


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


@app.post("/query", response_model=QueryResponse)
async def query_orchestrator(request: QueryRequest):
    try:
        if not request.query or not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")

        result = await process_query(request.query)

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
        print(f"Error processing query: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
