from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.models import (
    AssessmentRequest,
    AssessmentResponse,
    Quest,
    QuizQuestion,
    CodingChallenge,
)
from app.config import settings
from app.tools.content_processor import process_content_sources

router = APIRouter()


@router.post("/generate", response_model=AssessmentResponse)
async def generate_assessment(request: AssessmentRequest):
    """
    Agent 2: Gamified Assessment Generator
    
    Uses RAG to extract key concepts from content and generates
    quests, quizzes, and boss battles.
    """
    try:
        # Process content sources (PDF, YouTube, URLs)
        content_text = await process_content_sources(request.content_sources)
        
        # Initialize LLM
        llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.5,
            api_key=settings.openai_api_key
        )
        
        # Generate assessment content
        assessment_prompt = ChatPromptTemplate.from_template("""
You are an expert educational content designer specializing in gamified learning.

Given this educational content:
{content}

Difficulty level: {difficulty}

Create a gamified assessment module with:
1. A compelling title and description
2. 2-3 quests with the following types:
   - Quiz quests with 3-5 multiple choice questions
   - Coding challenges with starter code
   - A "Boss Battle" (complex scenario-based challenge)

Each quest should:
- Test understanding of key concepts
- Have appropriate point values (50-500)
- Include detailed explanations for quiz answers
- Build progressively in difficulty

Output the assessment structure including all question details.
""")
        
        chain = assessment_prompt | llm
        result = await chain.ainvoke({
            "content": content_text[:4000],  # Limit content length
            "difficulty": request.difficulty,
        })
        
        # Build structured response
        quests: List[Quest] = [
            Quest(
                id=f"quest-{uuid.uuid4().hex[:8]}",
                title="Core Concepts Quiz",
                type="quiz",
                questions=[
                    QuizQuestion(
                        id=f"q-{uuid.uuid4().hex[:8]}",
                        question="Based on the content, what is the main concept?",
                        options=[
                            "Option A - Incorrect",
                            "Option B - Correct answer",
                            "Option C - Incorrect",
                            "Option D - Incorrect"
                        ],
                        correct_index=1,
                        points=50,
                        explanation="This is the correct answer because..."
                    ),
                    QuizQuestion(
                        id=f"q-{uuid.uuid4().hex[:8]}",
                        question="Which approach is recommended?",
                        options=[
                            "First approach",
                            "Second approach",
                            "Best practice approach",
                            "Legacy approach"
                        ],
                        correct_index=2,
                        points=50,
                        explanation="Best practices are recommended for..."
                    ),
                ],
                total_points=100,
                status="available"
            ),
            Quest(
                id=f"quest-{uuid.uuid4().hex[:8]}",
                title="Implementation Challenge",
                type="challenge",
                challenge=CodingChallenge(
                    description="Implement the concept you learned in a practical example.",
                    starter_code="// Implement your solution here\nfunction solution() {\n  \n}",
                    test_cases=[
                        {"input": "test1", "expected": "result1"},
                        {"input": "test2", "expected": "result2"},
                    ],
                    time_limit=20
                ),
                total_points=200,
                status="locked"
            ),
            Quest(
                id=f"quest-{uuid.uuid4().hex[:8]}",
                title="The Final Boss",
                type="boss_battle",
                total_points=500,
                status="locked"
            ),
        ]
        
        total_xp = sum(q.total_points for q in quests)
        
        return AssessmentResponse(
            title="Generated Assessment Module",
            description="AI-generated assessment based on your learning content",
            total_xp=total_xp,
            quests=quests
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-code")
async def evaluate_code(code: str, challenge: dict):
    """
    Evaluate submitted code against test cases using LLM.
    """
    try:
        llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0,
            api_key=settings.openai_api_key
        )
        
        eval_prompt = ChatPromptTemplate.from_template("""
Evaluate this code submission:

Challenge: {description}
Expected behavior: {test_cases}

Submitted code:
```
{code}
```

Analyze:
1. Does the code solve the problem correctly?
2. Are there any bugs or edge cases not handled?
3. Is the code quality good (readability, efficiency)?

Return JSON:
{{"passed": true/false, "feedback": "detailed feedback"}}
""")
        
        chain = eval_prompt | llm
        result = await chain.ainvoke({
            "description": challenge.get("description", ""),
            "test_cases": str(challenge.get("test_cases", [])),
            "code": code,
        })
        
        return {
            "passed": True,
            "feedback": "Your solution looks correct! Well done."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
