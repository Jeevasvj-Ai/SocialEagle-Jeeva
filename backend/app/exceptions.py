"""Custom application exceptions and their FastAPI exception handlers."""
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base class for all custom application exceptions."""

    def __init__(self, message: str, code: str, status_code: int = 500) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str) -> None:
        super().__init__(f"{resource} not found", "NOT_FOUND", 404)


class ConflictError(AppException):
    """Raised when a request conflicts with the current state of a resource."""

    def __init__(self, message: str) -> None:
        super().__init__(message, "CONFLICT", 409)


class UnauthorizedError(AppException):
    """Raised when authentication fails or is missing."""

    def __init__(self, message: str = "Not authorized") -> None:
        super().__init__(message, "UNAUTHORIZED", 401)


class ValidationError(AppException):
    """Raised when input fails domain-level validation."""

    def __init__(self, message: str) -> None:
        super().__init__(message, "VALIDATION_ERROR", 422)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle all known AppException subclasses with a consistent payload."""
    logger.warning("AppException handled: %s (%s) on %s", exc.message, exc.code, request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for any exception not explicitly handled elsewhere."""
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred"}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the given FastAPI app instance."""
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
