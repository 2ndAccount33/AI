from typing import List
import os

from app.models import Resource
from app.config import settings


async def search_learning_resources(skill: str) -> List[Resource]:
    """
    Search for learning resources using Tavily or fallback to curated list.
    """
    try:
        # Try Tavily search if API key available
        if settings.tavily_api_key:
            from tavily import TavilyClient
            
            client = TavilyClient(api_key=settings.tavily_api_key)
            
            response = client.search(
                query=f"best {skill} tutorial course for developers",
                search_depth="advanced",
                max_results=5
            )
            
            resources = []
            for result in response.get("results", []):
                resource_type = "article"
                url = result.get("url", "")
                
                if "youtube.com" in url or "youtu.be" in url:
                    resource_type = "video"
                elif "udemy.com" in url or "coursera.org" in url:
                    resource_type = "course"
                elif "tutorial" in url.lower():
                    resource_type = "tutorial"
                elif "docs." in url or "documentation" in url:
                    resource_type = "documentation"
                
                resources.append(Resource(
                    title=result.get("title", skill + " Resource"),
                    url=url,
                    type=resource_type
                ))
            
            return resources[:5]
    
    except Exception as e:
        print(f"Tavily search failed: {e}")
    
    # Fallback to curated resources
    curated_resources = {
        "TypeScript": [
            Resource(title="TypeScript Official Documentation", url="https://www.typescriptlang.org/docs/", type="documentation"),
            Resource(title="TypeScript Deep Dive", url="https://basarat.gitbook.io/typescript/", type="tutorial"),
            Resource(title="TypeScript Full Course", url="https://www.youtube.com/watch?v=BwuLxPH8IDs", type="video"),
        ],
        "React": [
            Resource(title="React Official Tutorial", url="https://react.dev/learn", type="documentation"),
            Resource(title="React Crash Course", url="https://www.youtube.com/watch?v=w7ejDZ8SWv8", type="video"),
        ],
        "Node.js": [
            Resource(title="Node.js Official Docs", url="https://nodejs.org/en/docs/", type="documentation"),
            Resource(title="Node.js Tutorial", url="https://www.tutorialspoint.com/nodejs/", type="tutorial"),
        ],
        "AWS": [
            Resource(title="AWS Free Training", url="https://aws.amazon.com/training/", type="course"),
            Resource(title="AWS Fundamentals", url="https://www.coursera.org/specializations/aws-fundamentals", type="course"),
        ],
        "System Design": [
            Resource(title="System Design Primer", url="https://github.com/donnemartin/system-design-primer", type="tutorial"),
            Resource(title="Grokking System Design", url="https://www.designgurus.io/course/grokking-the-system-design-interview", type="course"),
        ],
    }
    
    # Return curated or generic resources
    if skill in curated_resources:
        return curated_resources[skill]
    
    # Generic fallback
    return [
        Resource(
            title=f"{skill} Tutorial",
            url=f"https://www.google.com/search?q={skill}+tutorial",
            type="tutorial"
        ),
        Resource(
            title=f"{skill} Documentation",
            url=f"https://www.google.com/search?q={skill}+documentation",
            type="documentation"
        ),
    ]
