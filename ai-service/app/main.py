from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from app.routers import skill_gap, assessment, aptitude, embeddings, orchestration
from app.config import settings

load_dotenv()

app = FastAPI(
    title="AI Automation Platform - AI Service",
    description="Python AI backend with LangChain agents for skill analysis, assessment generation, and aptitude testing",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(skill_gap.router, prefix="/api/v1/agents/skill-gap", tags=["Skill Gap Agent"])
app.include_router(assessment.router, prefix="/api/v1/agents/assessment", tags=["Assessment Agent"])
app.include_router(aptitude.router, prefix="/api/v1/agents/aptitude", tags=["Aptitude Agent"])
app.include_router(orchestration.router, prefix="/api/v1/agents/orchestration", tags=["Multi-Agent Orchestration"])
app.include_router(embeddings.router, prefix="/api/v1/embeddings", tags=["Embeddings"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}


@app.get("/")
async def root():
    return {
        "message": "AI Automation Platform - AI Service",
        "docs": "/docs",
        "agents": [
            "skill-gap",
            "assessment",
            "aptitude",
            "orchestration"
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
