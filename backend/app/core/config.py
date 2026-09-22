import os

class Settings:
    PROJECT_NAME: str = "Cafe on Wheels"
    PROJECT_DESCRIPTION: str = "A private sanctuary in motion - Luxury themed cafe van bookings"
    VERSION: str = "1.0.0"
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "cafe_on_wheels")
    
    # Security & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "velvet_gold_super_secret_jwt_key_2026_cafe_wheels")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # PayU Configuration
    PAYU_MERCHANT_KEY: str = os.getenv("PAYU_MERCHANT_KEY", "mock_merchant_key")
    PAYU_MERCHANT_SALT: str = os.getenv("PAYU_MERCHANT_SALT", "mock_merchant_salt_12345")
    PAYU_BASE_URL: str = os.getenv("PAYU_BASE_URL", "https://test.payu.in/_payment")
    PAYU_SIMULATED_MODE: bool = os.getenv("PAYU_SIMULATED_MODE", "true").lower() in ("true", "1", "yes")
    
    # Pricing defaults
    DEFAULT_INCLUDED_KM: float = 10.0
    DEFAULT_PER_KM_RATE_INR: float = 8.0
    GST_TAX_PERCENTAGE: float = 5.0
    
    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Weather
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")

settings = Settings()
