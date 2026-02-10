import base64
import json
from io import BytesIO
from typing import List

from PyPDF2 import PdfReader
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from app.models import ResumeData
from app.config import settings


async def parse_resume(resume_base64: str) -> ResumeData:
    """
    Parse resume PDF and extract structured data using REAL LLM.
    
    1. Extracts text from PDF using PyPDF2
    2. Sends text to GPT-4 for structured extraction
    3. Returns actual skills/experience/education from the resume
    """
    try:
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
        llm = ChatOpenAI(
            model="gpt-4o",
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
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        parsed_data = json.loads(response_text)
        
        return ResumeData(
            skills=parsed_data.get("skills", ["Skills not found"]),
            experience=parsed_data.get("experience", ["Experience not found"]),
            education=parsed_data.get("education", ["Education not found"])
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return ResumeData(
            skills=["Error parsing LLM response"],
            experience=["Please try again"],
            education=["Unknown"]
        )
    except Exception as e:
        print(f"Resume parsing error: {e}")
        print("Falling back to local regex extraction...")
        
        # IMPROVED FALLBACK: Extract skills via regex from the text we already extracted
        # This ensures the "demo" still works even if OpenAI is out of credits
        skills_found = []
        common_skills = [
            "Python", "Java", "JavaScript", "React", "Node.js", "AWS", "Docker", 
            "Kubernetes", "SQL", "NoSQL", "TypeScript", "C++", "C#", "Go", "Rust", 
            "Swift", "Kotlin", "Flutter", "Android", "iOS", "Machine Learning", 
            "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Git", "Linux"
        ]
        
        # Check for skills in the extracted text
        if 'resume_text' in locals() and resume_text:
            lower_text = resume_text.lower()
            for skill in common_skills:
                # Simple check: is the skill name in the text?
                # (A real regex would be better but this works for demo)
                if skill.lower() in lower_text:
                    skills_found.append(skill)
        
        if not skills_found:
            skills_found = ["General Programming (Fallback)"]
            
        return ResumeData(
            skills=skills_found,
            experience=["Experience extracted locally (LLM unavailable)"],
            education=["Education extracted locally (LLM unavailable)"]
        )
