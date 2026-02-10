import asyncio
import base64
import os
import sys
import traceback

# Ensure we can import from 'app'
sys.path.append(os.getcwd())

from app.tools.resume_parser import parse_resume

async def main():
    if not os.path.exists("test_resume.pdf"):
        print("Error: test_resume.pdf not found")
        return

    with open("test_resume.pdf", "rb") as f:
        pdf_bytes = f.read()
        base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')

    print(f"Testing resume parser with {len(base64_pdf)} bytes of base64 data...")
    print("Calling parse_resume() - checking for REAL extraction...")
    
    try:
        result = await parse_resume(base64_pdf)
        
        print("\n" + "="*50)
        print("       PARSED RESUME RESULTS       ")
        print("="*50)
        print(f"SKILLS: {result.skills}")
        print("-" * 30)
        print(f"EXPERIENCE: {result.experience}")
        print("-" * 30)
        print(f"EDUCATION: {result.education}")
        print("="*50)
        
        # Validation logic
        skills_text = str(result.skills).lower()
        
        if "python" in skills_text and "react" in skills_text:
            print("\n[SUCCESS] Parser extracted key skills (Python, React)!")
        elif "parse error" in skills_text:
            print("\n[FAILURE] Parser returned error or empty text.")
        else:
            print("\n[WARNING] Parser ran but skills might be generic. Verify output above.")
            
    except Exception as e:
        print("\n[EXCEPTION] An error occurred:")
        print(str(e))
        print("\nTraceback:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
