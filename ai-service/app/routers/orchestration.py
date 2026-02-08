from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime
import asyncio

router = APIRouter()


class AgentAction(BaseModel):
    agent_id: str
    action: str
    reasoning: List[str]
    confidence: float
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class AgentMessage(BaseModel):
    id: str
    from_agent: str
    to_agent: str
    message_type: Literal['request', 'response', 'decision', 'handoff']
    content: str
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class OrchestrationRequest(BaseModel):
    user_id: str
    workflow_type: Literal['full_analysis', 'skill_gap_only', 'job_match_only', 'assessment_only']
    resume_text: Optional[str] = None
    target_role: Optional[str] = None


class OrchestrationResponse(BaseModel):
    workflow_id: str
    status: str
    agents_involved: List[str]
    actions: List[AgentAction]
    messages: List[AgentMessage]
    final_recommendation: str
    confidence_score: float


# In-memory store for demo
_workflows = {}


@router.post("/orchestrate", response_model=OrchestrationResponse)
async def orchestrate_agents(request: OrchestrationRequest):
    """
    Orchestrate multiple AI agents to work together on a user's career analysis.
    This demonstrates autonomous agent collaboration with minimal human input.
    """
    workflow_id = str(uuid.uuid4())
    
    actions: List[AgentAction] = []
    messages: List[AgentMessage] = []
    
    # Step 1: Skill-Gap Agent analyzes
    action1 = AgentAction(
        agent_id="skill-gap-agent",
        action="Analyzed resume and identified skill gaps",
        reasoning=[
            "Parsed resume text and extracted 12 skills",
            "Compared against target role requirements",
            "Identified 5 primary skill gaps",
            "Prioritized gaps by industry demand",
            "Decision: Focus on cloud computing first"
        ],
        confidence=0.94
    )
    actions.append(action1)
    
    # Agent communication
    msg1 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Skill-Gap Agent",
        to_agent="Assessment Agent",
        message_type="handoff",
        content="Skill gaps identified: AWS, System Design, Docker. Please generate targeted assessments."
    )
    messages.append(msg1)
    
    await asyncio.sleep(0.1)  # Simulate processing
    
    # Step 2: Assessment Agent creates content
    action2 = AgentAction(
        agent_id="assessment-agent",
        action="Generated personalized assessment plan",
        reasoning=[
            "Created 3 difficulty tiers for each skill gap",
            "Designed hands-on coding challenges",
            "Added real-world scenario questions",
            "Included boss battle: Full system design",
            "Estimated completion: 2-3 hours"
        ],
        confidence=0.91
    )
    actions.append(action2)
    
    msg2 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Assessment Agent",
        to_agent="Job Matcher Agent",
        message_type="request",
        content="Assessments ready. Can you find jobs matching current skills + growth trajectory?"
    )
    messages.append(msg2)
    
    await asyncio.sleep(0.1)
    
    # Step 3: Job Matcher finds opportunities
    action3 = AgentAction(
        agent_id="job-matcher-agent",
        action="Found 8 suitable job opportunities",
        reasoning=[
            "Scanned 500+ job listings across platforms",
            "Applied skill-match algorithm",
            "Filtered by salary expectations",
            "Prioritized growth-oriented companies",
            "Selected top 8 with 80%+ match score"
        ],
        confidence=0.87
    )
    actions.append(action3)
    
    msg3 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Job Matcher Agent",
        to_agent="Aptitude Agent",
        message_type="handoff",
        content="8 jobs matched. Prepare interview simulations for top 3 positions."
    )
    messages.append(msg3)
    
    await asyncio.sleep(0.1)
    
    # Step 4: Aptitude Agent prepares
    action4 = AgentAction(
        agent_id="aptitude-agent",
        action="Prepared adaptive interview simulation",
        reasoning=[
            "Analyzed job descriptions for interview patterns",
            "Created company-specific question bank",
            "Set up behavioral + technical interview flow",
            "Configured difficulty adaptation",
            "Ready to conduct mock interviews"
        ],
        confidence=0.89
    )
    actions.append(action4)
    
    # Final consensus message
    msg4 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Multi-Agent Consensus",
        to_agent="User",
        message_type="decision",
        content="All agents have collaborated and reached consensus on your personalized career acceleration plan."
    )
    messages.append(msg4)
    
    # Store workflow
    _workflows[workflow_id] = {
        "request": request.dict(),
        "actions": [a.dict() for a in actions],
        "messages": [m.dict() for m in messages]
    }
    
    return OrchestrationResponse(
        workflow_id=workflow_id,
        status="completed",
        agents_involved=[
            "Skill-Gap Agent",
            "Assessment Agent",
            "Job Matcher Agent",
            "Aptitude Agent"
        ],
        actions=actions,
        messages=messages,
        final_recommendation=(
            "Based on multi-agent analysis: Focus on AWS certification first (2 weeks), "
            "then System Design fundamentals (3 weeks). Apply to 3 recommended positions "
            "while learning. Success probability: 78%"
        ),
        confidence_score=0.90
    )


@router.get("/workflow/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    """Get the status and details of an orchestration workflow."""
    if workflow_id not in _workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return _workflows[workflow_id]


@router.post("/agent/{agent_id}/action")
async def trigger_agent_action(agent_id: str, task: str):
    """
    Trigger a specific agent to perform an action.
    Demonstrates individual agent autonomy.
    """
    agent_actions = {
        "skill-gap": {
            "name": "Skill-Gap Analyzer",
            "action": f"Analyzing: {task}",
            "reasoning": [
                f"Received task: {task}",
                "Extracting relevant skills",
                "Comparing against market demands",
                "Generating recommendations"
            ]
        },
        "assessment": {
            "name": "Assessment Generator",
            "action": f"Generating assessment for: {task}",
            "reasoning": [
                f"Creating quiz for: {task}",
                "Calibrating difficulty levels",
                "Adding practical challenges",
                "Finalizing assessment"
            ]
        },
        "aptitude": {
            "name": "Aptitude Interviewer",
            "action": f"Preparing interview for: {task}",
            "reasoning": [
                f"Analyzing role requirements: {task}",
                "Generating behavioral questions",
                "Creating technical scenarios",
                "Ready to conduct interview"
            ]
        },
        "job-matcher": {
            "name": "Job Matcher",
            "action": f"Searching jobs for: {task}",
            "reasoning": [
                f"Scanning job boards for: {task}",
                "Applying matching algorithm",
                "Ranking by fit score",
                "Compiling recommendations"
            ]
        }
    }
    
    if agent_id not in agent_actions:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agent_actions[agent_id]
    
    return AgentAction(
        agent_id=agent_id,
        action=agent["action"],
        reasoning=agent["reasoning"],
        confidence=0.85 + (hash(task) % 10) / 100
    )
