from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DriverLocationUpdate(BaseModel):
    lat: float
    lng: float
    heading: Optional[float] = 0.0
    speed_kmh: Optional[float] = 0.0
    timestamp: Optional[datetime] = None

class RideTrackingState(BaseModel):
    booking_id: str
    driver_location: DriverLocationUpdate
    progress_percent: float
    eta_minutes: int
    status: str  # "not_started" | "en_route" | "arrived" | "completed"
    distance_remaining_km: float
    updated_at: datetime
