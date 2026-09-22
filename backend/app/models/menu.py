from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MenuItemBase(BaseModel):
    name: str
    category: str  # "Coffee & Beverages" | "Bakery & Desserts" | "Breakfast" | "Full Meals" | "Regional Cuisine" | "Vegan/Vegetarian" | "Kids Menu"
    description: Optional[str] = ""
    price_inr: float
    is_veg: bool = True
    image_url: str
    is_available: bool = True
    tags: List[str] = []

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price_inr: Optional[float] = None
    is_veg: Optional[bool] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    tags: Optional[List[str]] = None

class MenuItemResponse(MenuItemBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
