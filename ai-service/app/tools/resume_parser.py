import base64
from io import BytesIO
from typing import List

from app.models import ResumeData


async def parse_resume(resume_base64: str) -> ResumeData:
    """
    Parse resume PDF and extract structured data.
    
    In production, this would use PyPDF2 and LLM for extraction.
    """
    try:
        # Decode base64
        pdf_bytes = base64.b64decode(resume_base64)
        
        # In production: Use PyPDF2 to extract text
        # from PyPDF2 import PdfReader
        # reader = PdfReader(BytesIO(pdf_bytes))
        # text = ""
        # for page in reader.pages:
        #     text += page.extract_text()
        
        # Then use LLM to extract structured data
        # For demo, return mock data
        return ResumeData(
            skills=["JavaScript", "React", "CSS", "HTML", "Git"],
            experience=[
                "2 years as Frontend Developer",
                "Built e-commerce web applications"
            ],
            education=[
                "BS in Computer Science"
            ]
        )
        
    except Exception as e:
        # Return default on error
        return ResumeData(
            skills=["General Programming"],
            experience=["Entry Level"],
            education=["Unknown"]
        )
