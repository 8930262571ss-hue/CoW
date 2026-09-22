import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import mongomock_motor
from app.core.config import settings

logger = logging.getLogger("cafe_on_wheels.database")

class Database:
    client = None
    db = None
    is_mock = False

db = Database()

async def connect_to_mongo():
    """
    Connect to MongoDB via Motor.
    If live MongoDB is unreachable, gracefully fall back to AsyncMongoMockClient.
    """
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000
        )
        # Test connection with a ping
        await client.admin.command('ping')
        db.client = client
        db.db = client[settings.MONGODB_DB_NAME]
        db.is_mock = False
        logger.info(f"Connected to live MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to AsyncMongoMockClient in-memory engine.")
        mock_client = mongomock_motor.AsyncMongoMockClient()
        db.client = mock_client
        db.db = mock_client[settings.MONGODB_DB_NAME]
        db.is_mock = True
        logger.info("Using AsyncMongoMockClient for zero-friction database storage.")

    # Create indexes
    await setup_indexes()

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db.db

async def setup_indexes():
    """Setup essential indexes on collections."""
    try:
        database = db.db
        if database is not None:
            await database.users.create_index("email", unique=True)
            await database.bookings.create_index("user_id")
            await database.bookings.create_index("status")
            await database.ride_tracking.create_index("booking_id")
            await database.offers.create_index("code", unique=True)
            await database.themes.create_index("slug", unique=True)
    except Exception as e:
        logger.warning(f"Index creation note: {e}")
