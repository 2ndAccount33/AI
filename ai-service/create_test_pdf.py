from fpdf import FPDF
import os

pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=12)

resume_text = """
John Doe
Software Engineer
Email: johndoe@example.com

SKILLS:
- Python
- Machine Learning (TensorFlow, PyTorch)
- React & TypeScript
- Docker & Kubernetes

EXPERIENCE:
- Senior ML Engineer at Tech Corp (2020-Present)
  * Built recommendation engines serving 1M+ users
  * Deployed models using FastAPI and Docker
- Frontend Developer at WebSolutions (2018-2020)
  * Developed responsive UIs with React

EDUCATION:
- MS Computer Science, MIT
"""

for line in resume_text.split('\n'):
    pdf.cell(0, 10, txt=line, ln=1, align='L')

pdf.output("test_resume.pdf")
print(f"Created test_resume.pdf in {os.getcwd()}")
