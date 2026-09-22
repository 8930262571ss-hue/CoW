from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AddOnOption(BaseModel):
    name: str
    description: str
    price_inr: float
    type: str = "toggle"  # "toggle" | "customizable"
    default_config: Optional[Dict[str, Any]] = {}

class Hotspot360(BaseModel):
    id: str
    pitch: float
    yaw: float
    title: str
    description: str

class ThemeBase(BaseModel):
    name: str
    slug: str
    description: str
    tagline: Optional[str] = ""
    mood_tags: List[str] = []
    base_price_inr: float
    included_km: float = 10.0
    per_km_rate_inr: float = 8.0
    hero_images: List[str] = []
    gallery_images: List[str] = []
    tour_360_url: Optional[str] = ""
    tour_360_hotspots: List[Hotspot360] = []
    add_ons: List[AddOnOption] = []
    is_active: bool = True
    accent_color: Optional[str] = "#C9A667"
    suggested_music: Optional[str] = "Lo-Fi Jazz / Romantic Acoustic"
    ideal_for: Optional[str] = "Couples, Anniversaries, Proposals"

class ThemeCreate(ThemeBase):
    pass

class ThemeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    tagline: Optional[str] = None
    mood_tags: Optional[List[str]] = None
    base_price_inr: Optional[float] = None
    included_km: Optional[float] = None
    per_km_rate_inr: Optional[float] = None
    hero_images: Optional[List[str]] = None
    gallery_images: Optional[List[str]] = None
    tour_360_url: Optional[str] = None
    tour_360_hotspots: Optional[List[Hotspot360]] = None
    add_ons: Optional[List[AddOnOption]] = None
    is_active: Optional[bool] = None
    accent_color: Optional[str] = None

class ThemeResponse(ThemeBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
