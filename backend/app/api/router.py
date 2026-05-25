from fastapi import APIRouter
from app.api.endpoints.eda import router as eda_router
from app.api.endpoints.chat import router as chat_router
from app.api.endpoints.viz import router as viz_router

api_router = APIRouter(prefix="/api/v1")

# Include sub-routers
api_router.include_router(eda_router)
api_router.include_router(chat_router)
api_router.include_router(viz_router)
