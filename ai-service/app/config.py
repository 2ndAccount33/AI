from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str = ""
    tavily_api_key: str = ""
    chroma_persist_dir: str = "./chroma_db"
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
