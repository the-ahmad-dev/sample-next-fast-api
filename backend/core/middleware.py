import logging
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from .config import settings

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware for structured error responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            # Re-raise HTTP exceptions to be handled by FastAPI
            raise
        except Exception as exc:
            # Log the error
            logger.error(
                f"Unhandled error in {request.method} {request.url}: {str(exc)}",
                exc_info=True,
            )

            # Return structured error response
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "type": "internal_error",
                    "status_code": 500,
                },
            )


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request size."""

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            content_length = int(content_length)
            if content_length > settings.MAX_REQUEST_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={
                        "detail": "Request entity too large",
                        "type": "request_too_large",
                        "status_code": 413,
                        "max_size": settings.MAX_REQUEST_SIZE,
                    },
                )
        return await call_next(request)


def setup_middleware(app: FastAPI) -> None:
    """Setup all middleware for the FastAPI application."""

    # Add request size limit middleware
    app.add_middleware(RequestSizeLimitMiddleware)

    # Add error handling middleware
    app.add_middleware(ErrorHandlingMiddleware)

    # Custom exception handlers
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        """Custom handler for HTTP exceptions."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "type": "http_error",
                "status_code": exc.status_code,
            },
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: HTTPException) -> JSONResponse:
        """Custom 404 handler."""
        return JSONResponse(
            status_code=404,
            content={
                "detail": "Resource not found",
                "type": "not_found_error",
                "status_code": 404,
            },
        )
