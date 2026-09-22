from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SelectedAddOnInput(BaseModel):
    name: str
    price_inr: Optional[float] = 0.0
    config: Optional[Dict[str, Any]] = {}

class SelectedMenuItemInput(BaseModel):
    item_id: str
    quantity: int = 1

class GeoPointInput(BaseModel):
    lat: float
    lng: float
    address: str

class PricingCalculateRequest(BaseModel):
    theme_id: str
    pickup: GeoPointInput
    destination: GeoPointInput
    optional_stop: Optional[GeoPointInput] = None
    selected_add_ons: List[SelectedAddOnInput] = []
    menu_items: List[SelectedMenuItemInput] = []
    promo_code: Optional[str] = None

class PricingBreakdownResponse(BaseModel):
    distance_km: float
    estimated_duration_min: int
    base_price_inr: float
    included_km: float
    extra_km: float
    per_km_rate_inr: float
    extra_km_charge_inr: float
    add_ons_total_inr: float
    menu_total_inr: float
    subtotal_inr: float
    discount_inr: float
    tax_inr: float
    total_inr: float
    applied_offer_code: Optional[str] = None
