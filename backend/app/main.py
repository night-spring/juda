import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import api_router

logger = logging.getLogger("juda.main")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting up Juda REST API Server...")
    logger.info(f"System Running Host: {settings.HOST}:{settings.PORT}")
    yield

# Initialize FastAPI with project metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description=(
        "Juda REST API - A privacy-first, zero-disk exploratory data analysis (EDA), "
        "visualization, and chat intelligence engine powered by Google Gemini and Firebase Firestore."
    )
)

# Standard CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the main consolidated API router
app.include_router(api_router)

@app.get("/", tags=["General"])
def read_root():
    """Verify that the Juda service is active and responsive."""
    return {
        "status": "online",
        "message": "Welcome to Juda API. Explore interactive documentation at /docs",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


