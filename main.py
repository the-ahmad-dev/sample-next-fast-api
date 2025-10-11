"""
Main FastAPI application entry point.
Configures the application with middleware, routing, and static file serving.
"""

import os
import re
import time
from contextlib import asynccontextmanager

# Set timezone to UTC
os.environ["TZ"] = "UTC"
if hasattr(time, "tzset"):
    time.tzset()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.core.exceptions import AppException
from backend.core.logging import setup_logging
from backend.core.middleware import setup_middleware
from backend.core.rate_limit import close_rate_limiter, init_rate_limiter
from backend.modules.registry import get_api_router

# Setup logging first
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    await init_rate_limiter()
    yield
    await close_rate_limiter()


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=True,
    lifespan=lifespan,
)


# Global exception handler for custom application exceptions
@app.exception_handler(AppException)
async def app_exception_handler(req: Request, exc: AppException):
    """
    Handle custom application exceptions and convert to HTTP responses.

    This provides a centralized way to handle all business logic exceptions
    without needing try-except blocks in every endpoint.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


# Setup middleware
setup_middleware(app)

# Include API router
api_router = get_api_router()
app.include_router(api_router, prefix=settings.API_PREFIX)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.cors_methods_list,
    allow_headers=(
        [settings.CORS_ALLOW_HEADERS]
        if settings.CORS_ALLOW_HEADERS == "*"
        else settings.CORS_ALLOW_HEADERS
    ),
)


# Serve frontend static files
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend", "out")

# Mount static assets
app.mount(
    "/_next",
    StaticFiles(directory=os.path.join(frontend_dir, "_next")),
    name="static_next",
)


@app.get("/video/{file_path:path}")
async def serve_video(file_path: str):
    """Serve video files from out/video directory."""
    video_path = os.path.join(frontend_dir, "video", file_path)

    # Security: ensure path stays within video directory
    if not os.path.abspath(video_path).startswith(os.path.join(os.path.abspath(frontend_dir), "video")):
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.isfile(video_path):
        return FileResponse(video_path)

    raise HTTPException(status_code=404, detail="File not found")


@app.get("/images/{file_path:path}")
async def serve_images(file_path: str):
    """Serve image files from out/images directory."""
    image_path = os.path.join(frontend_dir, "images", file_path)

    # Security: ensure path stays within images directory
    if not os.path.abspath(image_path).startswith(os.path.join(os.path.abspath(frontend_dir), "images")):
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.isfile(image_path):
        return FileResponse(image_path)

    raise HTTPException(status_code=404, detail="File not found")


@app.get("/{path:path}")
async def serve_frontend(path: str = ""):
    """
    Serve the frontend application with security and proper error handling.
    """
    # Sanitize path input to prevent traversal
    if path and not re.match(r"^[a-zA-Z0-9_-]+$", path):
        raise HTTPException(status_code=404, detail="Page not found")

    template_path = "index.html" if path == "" else f"{path}.html"
    full_path = os.path.join(frontend_dir, template_path)

    # Additional security: ensure path stays within frontend_dir
    if not os.path.abspath(full_path).startswith(os.path.abspath(frontend_dir)):
        raise HTTPException(status_code=404, detail="Page not found")

    if os.path.isfile(full_path):
        return FileResponse(full_path, media_type="text/html")

    # If file doesn't exist, serve 404
    notfound_path = os.path.join(
        os.path.dirname(__file__), "frontend", "public", "404.html"
    )
    if os.path.isfile(notfound_path):
        return FileResponse(notfound_path, media_type="text/html", status_code=404)

    # Final fallback
    raise HTTPException(status_code=404, detail="Page not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
