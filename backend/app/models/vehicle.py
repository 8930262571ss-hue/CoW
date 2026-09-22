from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LocationCoordinates(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = ""

class VehicleBase(BaseModel):
    name: str
    model: str = "Mercedes-Benz Sprinter Luxury Custom"
    seating_capacity: int = 6
    status: str = "available"  # "available" | "on_ride" | "maintenance"
    current_location: LocationCoordinates = LocationCoordinates(lat=19.0760, lng=72.8777, address="Bandra West, Mumbai")
    render_image_url: str
    floor_plan_image_url: Optional[str] = ""
    assigned_driver_id: Optional[str] = None
    features: List[str] = [
        "Captains Swivel Velvet Chairs",
        "Dolby Atmos Acoustic System",
        "Artisanal Espresso Machine",
        "Temperature-Controlled Wine Fridge",
        "Panoramic Smart Skylight"
    ]
    is_active: bool = True

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    seating_capacity: Optional[int] = None
    status: Optional[str] = None
    current_location: Optional[LocationCoordinates] = None
    render_image_url: Optional[str] = None
    floor_plan_image_url: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
