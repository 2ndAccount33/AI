from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


# Resume and Job Description models
class Resource(BaseModel):
    title: str
    url: str
    type: Literal["course", "tutorial", "article", "video", "documentation"]
    duration: Optional[str] = None


class SkillGap(BaseModel):
    skill: str
    priority: Literal["high", "medium", "low"]
    reason: str


class LearningStage(BaseModel):
    id: str
    stage: int
    skill: str
    estimated_hours: int
    resources: List[Resource]
    milestones: List[str]
    xp_reward: int
    status: str = "locked"


class ResumeData(BaseModel):
    skills: List[str]
    experience: List[str]
    education: List[str]


class JobDescription(BaseModel):
    title: str
    company: Optional[str] = None
    requirements: List[str]
    preferred: List[str] = []


class SkillGapAnalysis(BaseModel):
    current_skills: List[str]
    required_skills: List[str]
    gaps: List[SkillGap]


class SkillGapRequest(BaseModel):
    resume_file: str  # Base64 encoded PDF
    job_description_id: Optional[str] = None
    job_description: Optional[JobDescription] = None


class SkillGapResponse(BaseModel):
    resume_data: ResumeData
    job_description: JobDescription
    analysis: SkillGapAnalysis
    learning_path: List[LearningStage]
    total_estimated_hours: int
    recommended_pace: str


# Assessment models
class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    points: int
    explanation: str


class CodingChallenge(BaseModel):
    description: str
    starter_code: str
    test_cases: List[dict]
    time_limit: int


class Quest(BaseModel):
    id: str
    title: str
    type: Literal["quiz", "challenge", "boss_battle"]
    questions: Optional[List[QuizQuestion]] = None
    challenge: Optional[CodingChallenge] = None
    total_points: int
    earned_points: int = 0
    status: str = "locked"


class ContentSource(BaseModel):
    type: Literal["pdf", "youtube", "text", "url"]
    data: Optional[str] = None  # Base64 for PDF
    url: Optional[str] = None
    content: Optional[str] = None


class AssessmentRequest(BaseModel):
    content_sources: List[ContentSource]
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"


class AssessmentResponse(BaseModel):
    title: str
    description: str
    total_xp: int
    quests: List[Quest]


# Aptitude models
class AptitudeQuestion(BaseModel):
    id: str
    question: str
    question_type: Literal["conceptual", "coding", "scenario"]
    difficulty: int  # 1-10
    code_template: Optional[str] = None


class AptitudeEvaluation(BaseModel):
    question_id: str
    score: int  # 1-10
    feedback: str
    correct_answer: Optional[str] = None


class AptitudeAnalysis(BaseModel):
    overall_score: int
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    suggested_roadmap_updates: List[str]


class GenerateQuestionRequest(BaseModel):
    target_role: str
    difficulty: int = 5


class EvaluateResponseRequest(BaseModel):
    question: AptitudeQuestion
    response: str
    code: Optional[str] = None


class AnalyzeSessionRequest(BaseModel):
    questions: List[dict]
