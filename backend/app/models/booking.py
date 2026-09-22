from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.pricing import GeoPointInput, SelectedAddOnInput

class BookingMenuItem(BaseModel):
    item_id: str
    name: str
    quantity: int
    price_at_booking: float

class BookingPricing(BaseModel):
    base_price_inr: float
    distance_km: float
    extra_km_charge_inr: float
    add_ons_total_inr: float
    menu_total_inr: float
    tax_inr: float
    discount_inr: float = 0.0
    total_inr: float

class BookingCreate(BaseModel):
    theme_id: str
    selected_add_ons: List[SelectedAddOnInput] = []
    menu_items: List[Dict[str, Any]] = []
    pickup_location: GeoPointInput
    destination: GeoPointInput
    optional_stop: Optional[GeoPointInput] = None
    guest_count: int = 2
    scheduled_date: str
    scheduled_time_slot: str
    vehicle_id: Optional[str] = None
    special_requests: Optional[str] = ""
    promo_code: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    user_id: str
    theme_id: str
    theme_name: Optional[str] = ""
    theme_image: Optional[str] = ""
    selected_add_ons: List[Dict[str, Any]] = []
    menu_items: List[BookingMenuItem] = []
    pickup_location: GeoPointInput
    destination: GeoPointInput
    optional_stop: Optional[GeoPointInput] = None
    estimated_distance_km: float
    estimated_duration_min: int
    guest_count: int
    scheduled_date: str
    scheduled_time_slot: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    pricing: BookingPricing
    status: str  # "pending_payment"|"confirmed"|"in_progress"|"completed"|"cancelled"
    special_requests: Optional[str] = ""
    payment_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
