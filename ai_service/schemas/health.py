from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field(..., example="HireIQ AI Microservice")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="production")
    uptime_seconds: float


class ReadinessResponse(BaseModel):
    status: str = Field(..., example="ready")
    checks: Dict[str, Any]
