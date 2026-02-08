from fastapi import APIRouter, HTTPException
from typing import List, Dict
from collections import defaultdict

router = APIRouter()

# Simple in-memory store (replaces ChromaDB for Python 3.14 compatibility)
# In production with Python 3.11/3.12, use ChromaDB
_memory_store: Dict[str, List[dict]] = defaultdict(list)


@router.post("/ingest")
async def ingest_content(
    content: str,
    collection_name: str = "default",
    metadata: dict = None
):
    """
    Ingest content into memory store.
    Note: Using in-memory store due to Python 3.14 compatibility issues with ChromaDB.
    """
    try:
        doc_id = f"doc-{len(_memory_store[collection_name])}"
        
        _memory_store[collection_name].append({
            "id": doc_id,
            "content": content,
            "metadata": metadata or {}
        })
        
        return {
            "success": True,
            "document_id": doc_id,
            "collection": collection_name,
            "note": "Using in-memory store (ChromaDB requires Python 3.11/3.12)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/query")
async def query_embeddings(
    query: str,
    collection_name: str = "default",
    n_results: int = 5
):
    """
    Query memory store for relevant content.
    Simple keyword matching (semantic search requires ChromaDB).
    """
    try:
        docs = _memory_store.get(collection_name, [])
        
        # Simple keyword matching
        results = []
        query_lower = query.lower()
        for doc in docs:
            if query_lower in doc["content"].lower():
                results.append(doc)
                if len(results) >= n_results:
                    break
        
        return {
            "query": query,
            "results": results,
            "note": "Using simple keyword matching (semantic search requires Python 3.11/3.12 with ChromaDB)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/collection/{collection_name}")
async def delete_collection(collection_name: str):
    """
    Delete a collection from memory store.
    """
    try:
        if collection_name in _memory_store:
            del _memory_store[collection_name]
        return {"success": True, "deleted": collection_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
