import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Production application settings with environment variable loading and validation."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Service Information
    PROJECT_NAME: str = "HireIQ AI Microservice"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="production", description="development | staging | production")
    DEBUG: bool = False

    # Server Binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 2

    # API Routing
    API_V1_PREFIX: str = "/api"

    # CORS Origins (support comma-separated string or list)
    CORS_ORIGINS: Union[List[str], str] = Field(
        default=["http://localhost:5173", "http://localhost:5000", "http://localhost:80"],
        description="Allowed CORS origin domains",
    )

    # AI & LLM Provider Keys
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini Generative AI API Key",
    )
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-1.5-pro"
    GEMINI_TIMEOUT_SECONDS: float = 30.0
    GEMINI_MAX_RETRIES: int = 3

    # File Upload & Safety Constraints
    MAX_FILE_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
    ]

    # Rate Limiting
    RATE_LIMIT_STANDARD: str = "120/minute"
    RATE_LIMIT_AI_ANALYSIS: str = "30/minute"
    RATE_LIMIT_CHAT: str = "40/minute"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_JSON_FORMAT: bool = True

    # Security
    INTERNAL_API_KEY: str = Field(
        default="",
        description="Optional shared secret key for Node.js-to-Python microservice authentication",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()
