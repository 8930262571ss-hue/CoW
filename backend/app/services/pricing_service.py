import math
from typing import Optional, List, Dict, Any
from app.core.config import settings

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on the Earth in kilometers."""
    r = 6371.0  # Earth's radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)

def calculate_total_route_distance_km(
    pickup_lat: float, pickup_lng: float,
    dest_lat: float, dest_lng: float,
    stop_lat: Optional[float] = None, stop_lng: Optional[float] = None
) -> float:
    if stop_lat is not None and stop_lng is not None:
        leg1 = calculate_haversine_distance_km(pickup_lat, pickup_lng, stop_lat, stop_lng)
        leg2 = calculate_haversine_distance_km(stop_lat, stop_lng, dest_lat, dest_lng)
        return round(leg1 + leg2, 2)
    return calculate_haversine_distance_km(pickup_lat, pickup_lng, dest_lat, dest_lng)

def estimate_duration_minutes(distance_km: float) -> int:
    """Estimate travel duration assuming average city/coastal luxury speed of ~25 km/h + 15 min buffer."""
    if distance_km <= 0:
        return 30
    travel_time_hours = distance_km / 25.0
    return max(30, int(round(travel_time_hours * 60 + 15)))

def compute_pricing_breakdown(
    base_price_inr: float,
    distance_km: float,
    included_km: float = 10.0,
    per_km_rate_inr: float = 8.0,
    add_ons_total_inr: float = 0.0,
    menu_total_inr: float = 0.0,
    discount_amount_inr: float = 0.0
) -> Dict[str, float]:
    extra_km = max(0.0, round(distance_km - included_km, 2))
    extra_km_charge_inr = round(extra_km * per_km_rate_inr, 2)
    
    subtotal = base_price_inr + extra_km_charge_inr + add_ons_total_inr + menu_total_inr
    discount = min(subtotal, round(discount_amount_inr, 2))
    taxable_amount = max(0.0, subtotal - discount)
    
    # 5% GST on luxury hospitality transportation
    tax_inr = round(taxable_amount * (settings.GST_TAX_PERCENTAGE / 100.0), 2)
    total_inr = round(taxable_amount + tax_inr, 2)
    
    return {
        "base_price_inr": base_price_inr,
        "included_km": included_km,
        "distance_km": distance_km,
        "extra_km": extra_km,
        "per_km_rate_inr": per_km_rate_inr,
        "extra_km_charge_inr": extra_km_charge_inr,
        "add_ons_total_inr": add_ons_total_inr,
        "menu_total_inr": menu_total_inr,
        "subtotal_inr": subtotal,
        "discount_inr": discount,
        "tax_inr": tax_inr,
        "total_inr": total_inr
    }
