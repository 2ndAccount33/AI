# How to Make Your Hackathon Project ACTUALLY Work
## Fixing the "Demo Mode" Problem

Your project has all the right architecture, but the AI agents aren't actually doing the work.
Here's how to fix it in ~30 minutes.

---

## Problem Summary

Current state: User uploads resume → Returns hardcoded data
What you need: User uploads resume → AI actually reads it and returns real data

---

## Fix #1: Resume Parser (CRITICAL - 10 minutes)

**File:** `ai-service/app/tools/resume_parser.py`

**Current code (lines 27-36):** Returns hardcoded data
**What to do:** Replace with actual PDF extraction + LLM parsing

```python
# DELETE lines 27-36 (the return ResumeData with hardcoded values)
# REPLACE WITH:

        # Step 1: Actually extract text from PDF
        pdf_bytes = base64.b64decode(resume_base64)
        reader = PdfReader(BytesIO(pdf_bytes))
        
        resume_text = ""
        for page in reader.pages:
            resume_text += page.extract_text() + "\n"
        
        if len(resume_text.strip()) < 50:
            return ResumeData(
                skills=["Parse Error: PDF appears empty"],
                experience=["Unable to extract text"],
                education=["Check PDF format"]
            )
        
        # Step 2: Use LLM to extract structured data
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        
        llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0,
            api_key=settings.openai_api_key
        )
        
        extraction_prompt = ChatPromptTemplate.from_template("""
Extract structured information from this resume. Return ONLY valid JSON.

Resume:
{resume_text}

JSON format:
{{
    "skills": ["skill1", "skill2"],
    "experience": ["job1 description", "job2 description"],
    "education": ["degree1", "degree2"]
}}

Output:
""")
        
        chain = extraction_prompt | llm
        result = await chain.ainvoke({"resume_text": resume_text[:4000]})
        
        # Step 3: Parse JSON response
        response_text = result.content.strip()
        
        # Clean up markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        
        import json
        parsed_data = json.loads(response_text)
        
        return ResumeData(
            skills=parsed_data.get("skills", ["Skills not found"]),
            experience=parsed_data.get("experience", ["Experience not found"]),
            education=parsed_data.get("education", ["Education not found"])
        )
```

**Don't forget:** Add `import json` at the top of the file!

---

## Fix #2: Skill Gap Analysis (CRITICAL - 10 minutes)

**File:** `ai-service/app/routers/skill_gap.py`

**Current code (lines 93-102):** Hardcoded gaps
**What to do:** Actually parse the LLM response

```python
# DELETE lines 94-102 (the hardcoded analysis variable)
# REPLACE WITH:

        # Parse LLM response to get actual gaps
        import json
        
        try:
            response_text = gap_result.content.strip()
            
            # Clean JSON if wrapped in markdown
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            
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
            
        except (json.JSONDecodeError, KeyError) as e:
            # Fallback: Manual comparison
            print(f"LLM parsing failed: {e}. Using fallback.")
            
            resume_skills = set(s.lower() for s in resume_data.skills)
            required_skills = set(s.lower() for s in job_description.requirements)
            missing = required_skills - resume_skills
            
            gaps = [
                SkillGap(skill=s.title(), priority="high", reason="Required skill")
                for s in missing
            ]
            
            analysis = SkillGapAnalysis(
                current_skills=resume_data.skills,
                required_skills=job_description.requirements,
                gaps=gaps
            )
```

---

## Fix #3: Aptitude Evaluation (MEDIUM PRIORITY - 5 minutes)

**File:** `ai-service/app/routers/aptitude.py`

**Current code (line 133):** `score = random.randint(6, 9)` ← This is fake!

**Replace with:**
```python
        # Parse score from LLM response
        try:
            response_text = result.content.strip()
            
            # Simple extraction - look for score mention
            import re
            score_match = re.search(r'score[:\s]+(\d+)', response_text.lower())
            
            if score_match:
                score = int(score_match.group(1))
                score = max(1, min(10, score))  # Clamp to 1-10
            else:
                score = 7  # Default if can't parse
            
            # Extract feedback (everything after "feedback:" or use full response)
            if "feedback:" in response_text.lower():
                feedback = response_text.split("feedback:")[1].strip()
            else:
                feedback = response_text
            
        except Exception as e:
            score = 7
            feedback = f"Evaluation completed. {response_text[:200]}"
```

---

## Testing Your Fixes

### 1. Create a Test Resume PDF

Create a simple PDF with:
```
John Doe
Software Engineer

SKILLS:
- Python
- Machine Learning
- TensorFlow

EXPERIENCE:
- ML Engineer at Tech Corp (3 years)
- Built recommendation systems

EDUCATION:
- MS Computer Science, MIT
```

### 2. Test the Resume Parser

```python
# Test file: test_parser.py
import base64
import asyncio
from ai-service.app.tools.resume_parser import parse_resume

async def test():
    with open("test_resume.pdf", "rb") as f:
        resume_base64 = base64.b64encode(f.read()).decode()
    
    result = await parse_resume(resume_base64)
    
    print("Skills:", result.skills)
    print("Experience:", result.experience)
    print("Education:", result.education)
    
    # Should see Python, Machine Learning, etc.
    assert "Python" in str(result.skills) or "python" in str(result.skills).lower()

asyncio.run(test())
```

### 3. Test End-to-End

1. Start your services: `docker-compose up`
2. Upload a real resume through the frontend
3. Check the console logs - you should see:
   - "Extracting text from PDF..."
   - "Calling OpenAI for extraction..."
   - Actual skills from YOUR resume, not hardcoded ones

---

## What This Changes

**BEFORE:**
```
User uploads resume about Python ML → Returns JavaScript/React skills ❌
User uploads 10 years experience → Returns "2 years" ❌
Different resumes → Same output every time ❌
```

**AFTER:**
```
User uploads Python resume → Returns Python, ML, TensorFlow ✅
User uploads 10 years experience → Returns actual experience ✅
Different resumes → Different accurate outputs ✅
```

---

## Quick Wins for Demo

Even if you can't fix everything, prioritize:

1. **Resume Parser** - Most important! Shows the AI is actually reading.
2. **Skill Gap** - Shows the AI is actually analyzing.
3. **Create 3 test PDFs** - Python dev, Frontend dev, Data Scientist
4. **Add "Try Examples" buttons** in frontend that load these test resumes

---

## For Your Presentation

**Honest approach:**
"This is a working prototype demonstrating autonomous agent patterns. 
The resume parsing and skill analysis use GPT-4 to extract real data.
Some features like ChromaDB embeddings are architected but not fully implemented
in the demo due to time constraints."

**DO NOT SAY:**
"Everything is fully production-ready" ← Judges will test this and you'll fail

**DO SAY:**
"We've implemented the core autonomous behaviors - the agents actually read
your resume, identify gaps, and generate custom learning paths. The failure
recovery system demonstrates true autonomous decision-making."

---

## Time Estimate

- Fix #1 (Resume Parser): 10 minutes
- Fix #2 (Skill Gap): 10 minutes  
- Fix #3 (Aptitude): 5 minutes
- Testing: 5 minutes
- **TOTAL: 30 minutes**

Do this NOW before submission!

---

## Still Questions?

The key insight: Your architecture is GREAT. You just need to connect
the LLM responses to the actual data flow instead of returning mock data.

Think of it like:
- You built a beautiful car ✅
- The engine works ✅
- But the gas pedal isn't connected to the engine ❌

These fixes connect the pedal to the engine. That's it.
