import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Initialize FastAPI app
app = FastAPI(title="Sample App")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Sample App API is running",
        "status": "healthy",
        "version": "1.0.0",
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
    template_path = "index.html" if path == "" else f"{path}.html"
    full_path = os.path.join(frontend_dir, template_path)

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
