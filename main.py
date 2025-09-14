import os
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.core.logging import setup_logging
from backend.core.middleware import setup_middleware

# Setup logging first
setup_logging()

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
)

# Setup middleware
setup_middleware(app)

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
async def health_check():
    """Comprehensive health check endpoint with detailed system information."""
    import os
    import platform
    import time
    from datetime import datetime

    import psutil

    # Calculate memory usage
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    process = psutil.Process()

    return {
        "status": "healthy",
        "message": f"{settings.PROJECT_NAME} API is running",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime_seconds": time.time() - process.create_time(),
        "system": {
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "architecture": platform.architecture()[0],
            "processor": platform.processor() or "Unknown",
            "hostname": platform.node(),
            "cpu_count": psutil.cpu_count(),
            "cpu_percent": psutil.cpu_percent(interval=0.1),
        },
        "memory": {
            "total_mb": round(memory.total / 1024 / 1024, 2),
            "available_mb": round(memory.available / 1024 / 1024, 2),
            "used_mb": round(memory.used / 1024 / 1024, 2),
            "percent_used": memory.percent,
        },
        "disk": {
            "total_gb": round(disk.total / 1024 / 1024 / 1024, 2),
            "free_gb": round(disk.free / 1024 / 1024 / 1024, 2),
            "used_gb": round(disk.used / 1024 / 1024 / 1024, 2),
            "percent_used": round((disk.used / disk.total) * 100, 2),
        },
        "process": {
            "pid": os.getpid(),
            "memory_mb": round(process.memory_info().rss / 1024 / 1024, 2),
            "cpu_percent": process.cpu_percent(),
            "threads": process.num_threads(),
            "create_time": datetime.fromtimestamp(process.create_time()).isoformat()
            + "Z",
        },
        "application": {
            "debug_mode": settings.DEBUG,
            "api_prefix": settings.API_PREFIX,
            "cors_origins_count": len(settings.cors_origins_list),
            "cors_origins": settings.cors_origins_list,
            "max_request_size_mb": round(settings.MAX_REQUEST_SIZE / 1024 / 1024, 2),
            "host": settings.HOST,
            "port": settings.PORT,
            "reload_mode": settings.RELOAD,
        },
        "dependencies": {
            "fastapi": "0.115.13",
            "uvicorn": "0.34.2",
            "pydantic": "2.11.7",
            "psutil": "6.1.0",
        },
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
