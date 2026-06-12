"""
Application configuration — reads from environment variables.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    max_tokens: int = 1024
    temperature: float = 0.7
    app_title: str = "FullStack AI"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
