from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Current provider — swap to ANTHROPIC_API_KEY when available
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""  # ready for future swap

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/growthskope"

    GOOGLE_CLOUD_PROJECT: str = "local-project"
    PUBSUB_EMULATOR_HOST: str = ""
    FIRESTORE_EMULATOR_HOST: str = ""

    FIREBASE_AUTH_EMULATOR_HOST: str = ""

    REDIS_URL: str = "redis://localhost:6379"

    ENVIRONMENT: str = "local"
    LOG_LEVEL: str = "INFO"
    SKIP_AUTH: bool = True

    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ("../.env", ".env")  # root first, then local fallback
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
