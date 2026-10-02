import time
import os
from fastapi import APIRouter, status
from ai_service.core.config import settings
from ai_service.schemas.health import HealthResponse, ReadinessResponse
from ai_service.services.gemini_service import gemini_service

router = APIRouter(tags=["Health & Telemetry"])

START_TIME = time.time()


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def liveness_check():
    """Liveness probe confirming service process is running and accepting traffic."""
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=round(time.time() - START_TIME, 2),
    )


@router.get("/ready", response_model=ReadinessResponse, status_code=status.HTTP_200_OK)
def readiness_check():
    """Readiness probe validating subsystem dependencies before receiving live traffic."""
    checks = {
        "gemini_api_configured": gemini_service.is_available,
        "environment": settings.ENVIRONMENT,
        "max_file_size_mb": settings.MAX_FILE_SIZE_BYTES / (1024 * 1024),
        "workers": settings.WORKERS,
    }
    return ReadinessResponse(
        status="ready",
        checks=checks,
    )
