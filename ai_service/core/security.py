import os
import re
from fastapi import Request, HTTPException, status, Security
from fastapi.security.api_key import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware
from ai_service.core.config import settings
from ai_service.core.logging import logger

API_KEY_HEADER = APIKeyHeader(name="X-Internal-API-Key", auto_error=False)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds enterprise HTTP security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        return response


def verify_internal_api_key(api_key: str = Security(API_KEY_HEADER)) -> bool:
    """
    Validates shared secret header if configured in production.
    If settings.INTERNAL_API_KEY is empty, internal authentication is bypassed.
    """
    if not settings.INTERNAL_API_KEY:
        return True

    if api_key != settings.INTERNAL_API_KEY:
        logger.warning("Unauthorized access attempt: invalid internal API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal microservice API key",
        )
    return True


def sanitize_filename(filename: str) -> str:
    """Removes path traversal characters and unsafe symbols from filenames."""
    basename = os.path.basename(filename)
    clean = re.sub(r"[^a-zA-Z0-9_.-]", "_", basename)
    return clean[:128]
