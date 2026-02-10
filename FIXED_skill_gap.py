from fastapi import APIRouter, HTTPException
from typing import List
import uuid
import json

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.models import (
    SkillGapRequest,
    SkillGapResponse,
    ResumeData,
    JobDescription,
    SkillGapAnalysis,
    SkillGap,
    LearningStage,
    Resource,
)
from app.config import settings
from app.tools.resume_parser import parse_resume
from app.tools.web_search import search_learning_resources

router = APIRouter()


@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Agent 1: Skill-Gap Roadmap Agent
    
    Analyzes resume against job description, identifies semantic gaps,
    finds live tutorials/resources, and generates a gamified learning path.
    """
    try:
        # Parse resume - THIS ACTUALLY READS THE PDF NOW
        resume_data = await parse_resume(request.resume_file)
        
        print(f"✅ Resume parsed! Found skills: {resume_data.skills}")
        
        # Get job description (from ID or use provided)
        job_description = request.job_description or JobDescription(
            title="Senior Full-Stack Developer",
            requirements=["React", "Node.js", "TypeScript", "AWS"],
            preferred=["Docker", "Kubernetes", "GraphQL"]
        )
        
        # Initialize LLM
        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            api_key=settings.openai_api_key
        )
        
        # Analyze skill gaps
        gap_analysis_prompt = ChatPromptTemplate.from_template("""
You are an expert career advisor and skills analyst.

Analyze the skill gap between this candidate's resume and the target job.

Resume Data:
- Skills: {skills}
- Experience: {experience}
- Education: {education}

Target Job:
- Title: {job_title}
- Required Skills: {requirements}
- Preferred Skills: {preferred}

Identify:
1. Skills the candidate already has
2. Skills required but missing (gaps)
3. Priority level for each gap (high/medium/low)
4. Reason why each skill is important

Output as JSON with this structure:
{{
    "current_skills": ["skill1", "skill2"],
    "required_skills": ["skill1", "skill2"],
    "gaps": [
        {{"skill": "TypeScript", "priority": "high", "reason": "Required for code quality"}}
    ]
}}
""")
        
        gap_chain = gap_analysis_prompt | llm
        gap_result = await gap_chain.ainvoke({
            "skills": ", ".join(resume_data.skills),
            "experience": ", ".join(resume_data.experience),
            "education": ", ".join(resume_data.education),
            "job_title": job_description.title,
            "requirements": ", ".join(job_description.requirements),
            "preferred": ", ".join(job_description.preferred),
        })
        
        # Parse LLM response to get actual gaps
        try:
            response_text = gap_result.content.strip()
            
            # Clean JSON if wrapped in markdown
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            gap_data = json.loads(response_text)
            
            # Build gaps from LLM analysis
            gaps = []
            for gap_item in gap_data.get("gaps", []):
                gaps.append(SkillGap(
                    skill=gap_item.get("skill", "Unknown"),
                    priority=gap_item.get("priority", "medium"),
                    reason=gap_item.get("reason", "Identified gap")
                ))
            
            analysis = SkillGapAnalysis(
                current_skills=gap_data.get("current_skills", resume_data.skills),
                required_skills=gap_data.get("required_skills", job_description.requirements),
                gaps=gaps
            )
            
            print(f"✅ Gap analysis complete! Found {len(gaps)} skill gaps")
            
        except (json.JSONDecodeError, KeyError) as parse_error:
            print(f"⚠️ LLM response parsing failed: {parse_error}. Using fallback comparison.")
            
            # Fallback: Manual set-based comparison
            resume_skills = set(s.lower() for s in resume_data.skills)
            required_skills = set(s.lower() for s in job_description.requirements)
            missing = required_skills - resume_skills
            
            gaps = [
                SkillGap(
                    skill=s.title(), 
                    priority="high", 
                    reason=f"Required for {job_description.title}"
                )
                for s in missing
            ]
            
            analysis = SkillGapAnalysis(
                current_skills=resume_data.skills,
                required_skills=job_description.requirements,
                gaps=gaps
            )
            
            print(f"✅ Fallback gap analysis complete! Found {len(gaps)} skill gaps")
        
        # ========================================================================
        # CRITICAL FIX: Generate learning path AFTER gap analysis (not just in fallback)
        # ========================================================================
        learning_path: List[LearningStage] = []
        
        for i, gap in enumerate(analysis.gaps):
            # Search for learning resources
            resources = await search_learning_resources(gap.skill)
            
            stage = LearningStage(
                id=f"stage-{uuid.uuid4().hex[:8]}",
                stage=i + 1,
                skill=gap.skill,
                estimated_hours=15 + (5 * i),  # Increase for later stages
                resources=resources[:3],  # Top 3 resources
                milestones=[
                    f"Complete {gap.skill} fundamentals",
                    f"Build a project using {gap.skill}",
                    f"Pass {gap.skill} assessment"
                ],
                xp_reward=300 + (100 * i),
                status="available" if i == 0 else "locked"
            )
            learning_path.append(stage)
        
        total_hours = sum(stage.estimated_hours for stage in learning_path)
        
        print(f"✅ Learning path generated with {len(learning_path)} stages!")
        
        return SkillGapResponse(
            resume_data=resume_data,
            job_description=job_description,
            analysis=analysis,
            learning_path=learning_path,
            total_estimated_hours=total_hours,
            recommended_pace="10 hours/week"
        )
        
    except Exception as e:
        print(f"❌ ERROR in analyze_skill_gap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-stages")
async def generate_additional_stages(weaknesses: List[str], recommendations: List[str]):
    """
    Generate additional learning stages based on aptitude test weaknesses.
    This is the feedback loop from Agent 3 to Agent 1.
    """
    try:
        stages = []
        
        for i, weakness in enumerate(weaknesses):
            resources = await search_learning_resources(weakness)
            
            stage = LearningStage(
                id=f"feedback-{uuid.uuid4().hex[:8]}",
                stage=100 + i,  # High number for feedback stages
                skill=f"Improve: {weakness}",
                estimated_hours=15,
                resources=resources[:2],
                milestones=[
                    f"Review {weakness} fundamentals",
                    f"Practice {weakness} exercises",
                    "Pass remediation assessment"
                ],
                xp_reward=400,
                status="locked"
            )
            stages.append(stage)
        
        return stages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
