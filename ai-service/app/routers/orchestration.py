from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
import uuid
from datetime import datetime
import asyncio

router = APIRouter()


# =============================================================================
# MOCK TOOL: Simulates job search with intentional failure scenario
# =============================================================================
def mock_job_search_tool(skill: str, location: str) -> List[dict]:
    """
    Simulates a job search API.
    - "London" always returns EMPTY (failure scenario)
    - "Remote" returns success with 3 jobs
    """
    if location.lower() == "london":
        # INTENTIONAL FAILURE - No jobs found
        return []
    elif location.lower() == "remote":
        # SUCCESS - Return dummy jobs
        return [
            {"id": "1", "title": f"Senior {skill} Developer", "company": "TechCorp", "salary": "₹25 LPA", "location": "Remote"},
            {"id": "2", "title": f"{skill} Engineer", "company": "StartupAI", "salary": "₹20 LPA", "location": "Remote"},
            {"id": "3", "title": f"Full Stack {skill}", "company": "GlobalTech", "salary": "₹22 LPA", "location": "Remote"},
        ]
    else:
        return [{"id": "1", "title": f"{skill} Developer", "company": "LocalCo", "salary": "₹15 LPA", "location": location}]


# =============================================================================
# DATA MODELS
# =============================================================================
class AgentAction(BaseModel):
    agent_id: str
    action: str
    reasoning: List[str]
    confidence: float
    status: Literal['success', 'failure', 'recovery', 'thinking'] = 'success'
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class AgentMessage(BaseModel):
    id: str
    from_agent: str
    to_agent: str
    message_type: Literal['request', 'response', 'decision', 'handoff', 'failure', 'recovery']
    content: str
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)


class OrchestrationRequest(BaseModel):
    user_id: str
    workflow_type: Literal['full_analysis', 'skill_gap_only', 'job_match_only', 'assessment_only', 'failure_recovery_demo']
    resume_text: Optional[str] = None
    target_role: Optional[str] = "Python Developer"
    target_location: Optional[str] = "London"  # Will fail initially


class OrchestrationResponse(BaseModel):
    workflow_id: str
    status: str
    agents_involved: List[str]
    actions: List[AgentAction]
    messages: List[AgentMessage]
    final_recommendation: str
    confidence_score: float
    jobs_found: List[dict] = []
    recovery_occurred: bool = False


_workflows = {}


@router.post("/orchestrate", response_model=OrchestrationResponse)
async def orchestrate_agents(request: OrchestrationRequest):
    """
    Orchestrate multiple AI agents with AUTONOMOUS FAILURE RECOVERY.
    
    This demonstrates the agent:
    1. Attempting a task (job search in London)
    2. FAILING (0 results)
    3. AUTONOMOUSLY deciding to change strategy
    4. RECOVERING by switching constraints
    5. SUCCEEDING without human intervention
    """
    workflow_id = str(uuid.uuid4())
    
    actions: List[AgentAction] = []
    messages: List[AgentMessage] = []
    
    skill = request.target_role or "Python"
    initial_location = request.target_location or "London"
    
    # =========================================================================
    # STEP 1: Skill-Gap Agent analyzes user intent
    # =========================================================================
    action1 = AgentAction(
        agent_id="skill-gap-agent",
        action=f"Analyzed user profile and job preferences",
        reasoning=[
            f"User is searching for: {skill} roles",
            f"Preferred location: {initial_location}",
            "Extracted 5 key skills from resume",
            "Passing requirements to Job Matcher Agent"
        ],
        confidence=0.95,
        status='success'
    )
    actions.append(action1)
    
    msg1 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Skill-Gap Agent",
        to_agent="Job Matcher Agent",
        message_type="handoff",
        content=f"User wants {skill} jobs in {initial_location}. Please search."
    )
    messages.append(msg1)
    
    await asyncio.sleep(0.2)
    
    # =========================================================================
    # STEP 2: Job Matcher attempts search - WILL FAIL
    # =========================================================================
    first_attempt_results = mock_job_search_tool(skill, initial_location)
    
    action2 = AgentAction(
        agent_id="job-matcher-agent",
        action=f"Searched for {skill} jobs in {initial_location}",
        reasoning=[
            f"Query: skill='{skill}', location='{initial_location}'",
            f"Results returned: {len(first_attempt_results)} jobs",
            "⚠️ FAILURE: Zero results found!",
            "Constraint may be too restrictive"
        ],
        confidence=0.30,
        status='failure'
    )
    actions.append(action2)
    
    msg2 = AgentMessage(
        id=str(uuid.uuid4()),
        from_agent="Job Matcher Agent",
        to_agent="Self",
        message_type="failure",
        content=f"❌ Search failed: 0 jobs found for '{skill}' in '{initial_location}'. Need to re-strategize."
    )
    messages.append(msg2)
    
    await asyncio.sleep(0.2)
    
    # =========================================================================
    # STEP 3: THE MAGIC MOMENT - Autonomous Recovery Decision
    # =========================================================================
    recovery_occurred = False
    final_results = first_attempt_results
    
    if len(first_attempt_results) == 0:
        # AUTONOMOUS DECISION: Change strategy without human input
        recovery_occurred = True
        
        action3 = AgentAction(
            agent_id="job-matcher-agent",
            action="🧠 AUTONOMOUS RECOVERY: Analyzing failure and adjusting strategy",
            reasoning=[
                "Step 1: Detected failure condition (0 results)",
                "Step 2: Analyzing constraints...",
                f"Step 3: Hypothesis - '{initial_location}' is too restrictive",
                "Step 4: Decision - Remove location constraint, try 'Remote'",
                "Step 5: No human intervention needed - proceeding autonomously"
            ],
            confidence=0.75,
            status='recovery'
        )
        actions.append(action3)
        
        msg3 = AgentMessage(
            id=str(uuid.uuid4()),
            from_agent="Job Matcher Agent",
            to_agent="Self",
            message_type="recovery",
            content=f"🔄 AUTONOMOUS PIVOT: Location '{initial_location}' yielded 0 results. Switching to 'Remote' without human approval."
        )
        messages.append(msg3)
        
        await asyncio.sleep(0.2)
        
        # =====================================================================
        # STEP 4: Retry with new strategy
        # =====================================================================
        new_location = "Remote"
        final_results = mock_job_search_tool(skill, new_location)
        
        action4 = AgentAction(
            agent_id="job-matcher-agent",
            action=f"Retried search with adjusted constraints",
            reasoning=[
                f"New query: skill='{skill}', location='{new_location}'",
                f"Results returned: {len(final_results)} jobs",
                "✅ SUCCESS: Found matching opportunities!",
                "Recovery strategy validated"
            ],
            confidence=0.92,
            status='success'
        )
        actions.append(action4)
        
        msg4 = AgentMessage(
            id=str(uuid.uuid4()),
            from_agent="Job Matcher Agent",
            to_agent="User",
            message_type="decision",
            content=f"✅ SUCCESS: Found {len(final_results)} jobs after autonomous strategy adjustment. No human input was required!"
        )
        messages.append(msg4)
    
    # =========================================================================
    # STEP 5: Final Summary
    # =========================================================================
    action5 = AgentAction(
        agent_id="orchestration-agent",
        action="Workflow completed with autonomous recovery",
        reasoning=[
            f"Initial attempt: FAILED ({initial_location})",
            "Recovery triggered: YES",
            "Human intervention required: NO",
            f"Final results: {len(final_results)} jobs found",
            "Demonstration of autonomous agentic behavior complete"
        ],
        confidence=0.95,
        status='success'
    )
    actions.append(action5)
    
    # Store workflow
    _workflows[workflow_id] = {
        "request": request.dict(),
        "actions": [a.dict() for a in actions],
        "messages": [m.dict() for m in messages],
        "recovery_occurred": recovery_occurred
    }
    
    return OrchestrationResponse(
        workflow_id=workflow_id,
        status="completed_with_recovery" if recovery_occurred else "completed",
        agents_involved=[
            "Skill-Gap Agent",
            "Job Matcher Agent",
            "Orchestration Agent"
        ],
        actions=actions,
        messages=messages,
        final_recommendation=(
            f"🎯 AUTONOMOUS RECOVERY SUCCESS!\n\n"
            f"Initial search '{skill} in {initial_location}' failed with 0 results.\n"
            f"Agent autonomously pivoted to 'Remote' and found {len(final_results)} opportunities.\n"
            f"No human intervention was required - true agentic behavior demonstrated!"
        ),
        confidence_score=0.92,
        jobs_found=final_results,
        recovery_occurred=recovery_occurred
    )


@router.get("/workflow/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    """Get the status and details of an orchestration workflow."""
    if workflow_id not in _workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return _workflows[workflow_id]


@router.post("/agent/{agent_id}/action")
async def trigger_agent_action(agent_id: str, task: str):
    """Trigger a specific agent to perform an action."""
    agent_actions = {
        "skill-gap": {
            "name": "Skill-Gap Analyzer",
            "action": f"Analyzing: {task}",
            "reasoning": [f"Received task: {task}", "Processing..."]
        },
        "job-matcher": {
            "name": "Job Matcher",
            "action": f"Searching for: {task}",
            "reasoning": [f"Query: {task}", "Executing search..."]
        }
    }
    
    if agent_id not in agent_actions:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentAction(
        agent_id=agent_id,
        action=agent_actions[agent_id]["action"],
        reasoning=agent_actions[agent_id]["reasoning"],
        confidence=0.85
    )
