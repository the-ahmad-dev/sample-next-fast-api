import os
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
)

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


@app.get("/health")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": f"{settings.PROJECT_NAME} API is running",
        "status": "healthy",
        "version": settings.VERSION,
    }


# Serve frontend static files
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend", "out")

# Mount static assets
app.mount(
    "/_next",
    StaticFiles(directory=os.path.join(frontend_dir, "_next")),
    name="static_next",
)


@app.get("/{path:path}")
async def serve_frontend(path: str = ""):
    """
    Serve the frontend application. Return 404 if the file does not exist.
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

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
    )
