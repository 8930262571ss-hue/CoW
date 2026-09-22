import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.services.seed_service import seed_initial_data
from app.routers import (
    auth, themes, vehicles, menu, pricing,
    bookings, payments, rides, offers, recommendations, admin
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cafe_on_wheels")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Cafe on Wheels backend...")
    await connect_to_mongo()
    await seed_initial_data()
    yield
    logger.info("Shutting down Cafe on Wheels backend...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows frontend on localhost:5173, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(themes.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(menu.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(rides.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": "A Private Sanctuary in Motion",
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }
