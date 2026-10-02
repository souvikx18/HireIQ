import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from ai_service.core.config import settings
from ai_service.core.logging import logger
from ai_service.core.security import SecurityHeadersMiddleware
from ai_service.core.exceptions import (
    AIServiceException,
    ai_service_exception_handler,
    validation_exception_handler,
    global_exception_handler,
)
from ai_service.api.v1.health import router as health_router
from ai_service.api.v1.resume import router as resume_router
from ai_service.api.v1.chat import router as chat_router

# Initialize production rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_STANDARD])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Production lifespan managing application startup and graceful shutdown."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    if settings.GEMINI_API_KEY:
        logger.info("Gemini API key detected; live generative LLM features enabled.")
    else:
        logger.warning("No GEMINI_API_KEY detected; running in fallback deterministic heuristic mode.")

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME} cleanly...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI Resume Screening, ATS Compatibility Scoring, and Recruiter Intelligence Microservice.",
    lifespan=lifespan,
    docs_url=None if settings.is_production and not settings.DEBUG else "/docs",
    redoc_url=None if settings.is_production and not settings.DEBUG else "/redoc",
    openapi_url=None if settings.is_production and not settings.DEBUG else "/openapi.json",
)

# Attach rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register custom exception handlers
app.add_exception_handler(AIServiceException, ai_service_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Security and CORS Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# Request timing & telemetry middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    return response


# Include Routers
app.include_router(health_router)
app.include_router(resume_router, prefix=settings.API_V1_PREFIX)
app.include_router(chat_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs" if not (settings.is_production and not settings.DEBUG) else "disabled_in_production",
    }
