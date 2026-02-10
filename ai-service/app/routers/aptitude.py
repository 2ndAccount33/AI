from fastapi import APIRouter, HTTPException
from typing import List
import uuid
import random

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.models import (
    AptitudeQuestion,
    AptitudeEvaluation,
    AptitudeAnalysis,
    GenerateQuestionRequest,
    EvaluateResponseRequest,
    AnalyzeSessionRequest,
)
from app.config import settings

router = APIRouter()


# Question templates by role and type
QUESTION_TEMPLATES = {
    "Full-Stack Developer": {
        "conceptual": [
            "Explain how the JavaScript event loop works and why it's important.",
            "What is the difference between SQL and NoSQL databases?",
            "Describe the request lifecycle in a Node.js Express application.",
            "What are React hooks and why were they introduced?",
        ],
        "coding": [
            "Write a function that implements debouncing.",
            "Create a simple Promise-based sleep function.",
            "Implement a function to deep clone an object.",
        ],
        "scenario": [
            "How would you design a real-time chat application?",
            "Describe how you would implement authentication in a microservices architecture.",
            "How would you optimize a slow database query?",
        ]
    }
}


@router.post("/generate-question", response_model=AptitudeQuestion)
async def generate_aptitude_question(request: GenerateQuestionRequest):
    """
    Generate an adaptive question based on target role and difficulty.
    """
    try:
        role_questions = QUESTION_TEMPLATES.get(
            request.target_role, 
            QUESTION_TEMPLATES["Full-Stack Developer"]
        )
        
        # Determine question type based on difficulty
        if request.difficulty <= 4:
            q_type = "conceptual"
        elif request.difficulty <= 7:
            q_type = random.choice(["conceptual", "coding"])
        else:
            q_type = random.choice(["coding", "scenario"])
        
        questions = role_questions.get(q_type, role_questions["conceptual"])
        question_text = random.choice(questions)
        
        code_template = None
        if q_type == "coding":
            code_template = "// Write your solution here\nfunction solution() {\n  \n}"
        
        return AptitudeQuestion(
            id=f"aptq-{uuid.uuid4().hex[:8]}",
            question=question_text,
            question_type=q_type,
            difficulty=request.difficulty,
            code_template=code_template
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate", response_model=AptitudeEvaluation)
async def evaluate_response(request: EvaluateResponseRequest):
    """
    Evaluate a candidate's response using LLM.
    """
    try:
        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            api_key=settings.openai_api_key
        )
        
        eval_prompt = ChatPromptTemplate.from_template("""
You are an expert technical interviewer evaluating a candidate's response.

Question ({question_type}, difficulty {difficulty}/10):
{question}

Candidate's Response:
{response}

{code_section}

Evaluate the response on a scale of 1-10 considering:
- Accuracy and correctness
- Depth of understanding
- Communication clarity
- For coding: code quality and edge case handling

Provide:
1. A score (1-10)
2. Constructive feedback (2-3 sentences)

Be fair but rigorous. A score of 7+ means excellent understanding.
""")
        
        code_section = ""
        if request.code:
            code_section = f"Code Submitted:\n```\n{request.code}\n```"
        
        chain = eval_prompt | llm
        result = await chain.ainvoke({
            "question_type": request.question.question_type,
            "difficulty": request.question.difficulty,
            "question": request.question.question,
            "response": request.response,
            "code_section": code_section,
        })
        
        # Parse score from actual LLM response
        import re
        
        try:
            response_text = result.content.strip()
            
            # Extract score - look for patterns like "Score: 8" or "score: 7/10"
            score_match = re.search(r'score[:\s]+(\d+)', response_text.lower())
            
            if score_match:
                score = int(score_match.group(1))
                score = max(1, min(10, score))  # Clamp to 1-10
            else:
                score = 7  # Default if can't parse
            
            # Extract feedback - everything after "feedback:" or use full response
            if "feedback:" in response_text.lower():
                feedback = response_text.lower().split("feedback:")[1].strip()
                # Capitalize first letter
                feedback = feedback[0].upper() + feedback[1:] if feedback else response_text
            else:
                feedback = response_text
                
        except Exception as e:
            score = 7
            feedback = f"Evaluation completed. {result.content[:200]}"
        
        return AptitudeEvaluation(
            question_id=request.question.id,
            score=score,
            feedback=feedback,
        )
        
    except Exception as e:
        # Fallback if LLM fails (e.g., quota exceeded)
        print(f"Aptitude evaluation failed: {e}. Using fallback.")
        
        # Simple heuristic for demo: length of response
        response_len = len(request.response)
        if response_len > 100:
            score = 8
            feedback = "Good detailed response. You covered the main points well."
        elif response_len > 50:
            score = 6
            feedback = "Decent attempt, but could be more detailed."
        else:
            score = 4
            feedback = "Response is too short. Please elaborate more."
            
        # If code was submitted, bump score
        if request.code and len(request.code) > 20:
            score = min(10, score + 2)
            feedback += " Good job including code."
    
        return AptitudeEvaluation(
            question_id=request.question.id,
            score=score,
            feedback=feedback,
        )


@router.post("/analyze", response_model=AptitudeAnalysis)
async def analyze_session(request: AnalyzeSessionRequest):
    """
    Generate comprehensive analysis of aptitude session.
    This feeds back to Agent 1 for roadmap updates.
    """
    try:
        # Calculate overall score from evaluations
        evaluations = [
            q.get("evaluation", {}) 
            for q in request.questions 
            if q.get("evaluation")
        ]
        
        if evaluations:
            avg_score = sum(e.get("score", 5) for e in evaluations) / len(evaluations)
        else:
            avg_score = 5
        
        overall_score = int(avg_score * 10)  # Convert to 0-100
        
        # Determine strengths and weaknesses based on question types and scores
        strengths = []
        weaknesses = []
        
        for q in request.questions:
            q_type = q.get("question", {}).get("question_type", "conceptual")
            score = q.get("evaluation", {}).get("score", 5)
            
            if score >= 7:
                if q_type == "conceptual":
                    strengths.append("Strong theoretical understanding")
                elif q_type == "coding":
                    strengths.append("Good coding skills")
                elif q_type == "scenario":
                    strengths.append("Strong system design thinking")
            elif score <= 5:
                if q_type == "conceptual":
                    weaknesses.append("Conceptual foundations need work")
                elif q_type == "coding":
                    weaknesses.append("Coding practice recommended")
                elif q_type == "scenario":
                    weaknesses.append("System design knowledge gaps")
        
        # Deduplicate
        strengths = list(set(strengths)) or ["Problem-solving approach"]
        weaknesses = list(set(weaknesses)) or ["Advanced topics"]
        
        recommendations = [
            f"Focus on improving: {w}" for w in weaknesses[:3]
        ]
        
        # Suggested roadmap updates (feeds back to Agent 1)
        suggested_updates = [
            w.replace("need work", "").replace("recommended", "").strip()
            for w in weaknesses
        ]
        
        return AptitudeAnalysis(
            overall_score=overall_score,
            strengths=strengths,
            weaknesses=weaknesses,
            recommendations=recommendations,
            suggested_roadmap_updates=suggested_updates
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
