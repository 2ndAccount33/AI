import base64
from typing import List
from io import BytesIO

from app.models import ContentSource


async def process_content_sources(sources: List[ContentSource]) -> str:
    """
    Process various content sources and extract text for RAG.
    """
    all_text = []
    
    for source in sources:
        try:
            if source.type == "pdf" and source.data:
                text = await extract_pdf_text(source.data)
                all_text.append(text)
                
            elif source.type == "youtube" and source.url:
                text = await get_youtube_transcript(source.url)
                all_text.append(text)
                
            elif source.type == "text" and source.content:
                all_text.append(source.content)
                
            elif source.type == "url" and source.url:
                text = await scrape_url_content(source.url)
                all_text.append(text)
                
        except Exception as e:
            print(f"Error processing {source.type}: {e}")
            continue
    
    return "\n\n".join(all_text)


async def extract_pdf_text(pdf_base64: str) -> str:
    """Extract text from base64 encoded PDF."""
    try:
        from PyPDF2 import PdfReader
        
        pdf_bytes = base64.b64decode(pdf_base64)
        reader = PdfReader(BytesIO(pdf_bytes))
        
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        return f"[PDF content - extraction failed: {e}]"


async def get_youtube_transcript(url: str) -> str:
    """Get transcript from YouTube video."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        
        # Extract video ID
        if "youtube.com/watch?v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        else:
            return "[Invalid YouTube URL]"
        
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([entry["text"] for entry in transcript])
        
        return text
    except Exception as e:
        return f"[YouTube transcript unavailable: {e}]"


async def scrape_url_content(url: str) -> str:
    """Scrape content from a URL."""
    try:
        import requests
        from bs4 import BeautifulSoup
        
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Remove scripts and styles
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = "\n".join(chunk for chunk in chunks if chunk)
        
        return text[:5000]  # Limit length
    except Exception as e:
        return f"[URL content unavailable: {e}]"
