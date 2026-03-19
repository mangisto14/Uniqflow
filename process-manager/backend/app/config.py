from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    secret_key: str = "change-me-min-32-chars-random-string"
    allowed_origins: str = "http://localhost:5173"
    ai_provider: str = "openai"  # openai | anthropic
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
