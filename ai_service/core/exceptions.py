from typing import Union
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from ai_service.core.logging import logger


class AIServiceException(Exception):
    """Base exception for all AI microservice domain errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class DocumentParsingError(AIServiceException):
    def __init__(self, message: str = "Unable to extract text from the provided document"):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class AIProviderError(AIServiceException):
    def __init__(self, message: str = "AI inference provider temporarily unavailable"):
        super().__init__(message, status_code=status.HTTP_502_BAD_GATEWAY)


class UnsupportedFileTypeError(AIServiceException):
    def __init__(self, message: str = "Unsupported document format"):
        super().__init__(message, status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)


async def ai_service_exception_handler(request: Request, exc: AIServiceException) -> JSONResponse:
    logger.warning(
        f"Domain exception on {request.method} {request.url.path}: {exc.message} (status {exc.status_code})"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message, "path": request.url.path},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning(f"Request validation failure on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Request body validation failed",
            "details": exc.errors(),
            "path": request.url.path,
        },
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        f"Unhandled 500 error processing {request.method} {request.url.path}: {str(exc)}"
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
            "path": request.url.path,
        },
    )
