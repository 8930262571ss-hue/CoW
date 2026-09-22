from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserPreferences(BaseModel):
    favorite_cuisines: List[str] = []
    favorite_moods: List[str] = []
    notify_weather: bool = True
    notify_events: bool = True
    notify_day: bool = True

class SavedPaymentMethod(BaseModel):
    type: str = "card"
    masked_details: str = "**** **** **** 4242"
    is_default: bool = False

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    password: str
    role: Optional[str] = "customer"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    role: str
    saved_themes: List[str] = []
    saved_payment_methods: List[SavedPaymentMethod] = []
    preferences: UserPreferences = UserPreferences()
    created_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
