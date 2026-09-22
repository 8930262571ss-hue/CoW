import pytest
from app.services.pricing_service import (
    calculate_haversine_distance_km,
    estimate_duration_minutes,
    compute_pricing_breakdown
)
from app.core.security import hash_password, verify_password, create_access_token, decode_token

def test_haversine_distance():
    # Distance between Bandra (19.0596, 72.8295) and Marine Drive (18.9438, 72.8232) is approx 12-14 km
    dist = calculate_haversine_distance_km(19.0596, 72.8295, 18.9438, 72.8232)
    assert 11.0 <= dist <= 15.0

def test_pricing_breakdown_within_included_km():
    # 8 km ride: extra_km should be 0, total should be base + 5% GST
    breakdown = compute_pricing_breakdown(
        base_price_inr=3499.0,
        distance_km=8.0,
        included_km=10.0,
        per_km_rate_inr=8.0,
        add_ons_total_inr=0.0,
        menu_total_inr=0.0,
        discount_amount_inr=0.0
    )
    assert breakdown["extra_km"] == 0.0
    assert breakdown["extra_km_charge_inr"] == 0.0
    assert breakdown["subtotal_inr"] == 3499.0
    expected_tax = round(3499.0 * 0.05, 2)
    assert breakdown["tax_inr"] == expected_tax
    assert breakdown["total_inr"] == 3499.0 + expected_tax

def test_pricing_breakdown_with_extra_km_and_addons():
    # 20 km ride (10 extra km at ₹8/km = ₹80), add-on ₹1499, menu ₹500
    breakdown = compute_pricing_breakdown(
        base_price_inr=3000.0,
        distance_km=20.0,
        included_km=10.0,
        per_km_rate_inr=8.0,
        add_ons_total_inr=1499.0,
        menu_total_inr=500.0,
        discount_amount_inr=500.0  # ₹500 promo
    )
    assert breakdown["extra_km"] == 10.0
    assert breakdown["extra_km_charge_inr"] == 80.0
    subtotal = 3000.0 + 80.0 + 1499.0 + 500.0
    assert breakdown["subtotal_inr"] == subtotal
    taxable = subtotal - 500.0
    expected_tax = round(taxable * 0.05, 2)
    assert breakdown["tax_inr"] == expected_tax
    assert breakdown["total_inr"] == round(taxable + expected_tax, 2)

def test_password_hashing():
    pwd = "secretPassword123!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_flow():
    data = {"sub": "user_123", "role": "admin"}
    token = create_access_token(data)
    decoded = decode_token(token)
    assert decoded["sub"] == "user_123"
    assert decoded["role"] == "admin"
    assert decoded["type"] == "access"
