from pydantic import BaseModel
from typing import Optional, List

class AIRecommendationResponse(BaseModel):
    theme_id: str
    theme_slug: str
    theme_name: str
    theme_hero_image: str
    trigger_type: str  # "weather" | "time" | "day" | "mood"
    badge_label: str
    headline: str
    message: str
    suggested_addons: List[str] = []
    weather_condition: Optional[str] = "Pleasant & Breezy"
    temperature_c: Optional[float] = 26.0
    cta_label: str = "Experience This Journey"
