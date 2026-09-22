from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OfferBase(BaseModel):
    code: str
    discount_type: str = "percentage"  # "flat" | "percentage"
    value: float
    applicable_theme_ids: List[str] = []
    min_order_value_inr: float = 0.0
    max_discount_inr: Optional[float] = None
    description: Optional[str] = ""
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    usage_limit: int = 1000
    times_used: int = 0
    is_active: bool = True

class OfferCreate(OfferBase):
    pass

class OfferResponse(OfferBase):
    id: str
    created_at: Optional[datetime] = None
