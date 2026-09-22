from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from app.core.database import get_database
from app.models.pricing import PricingCalculateRequest, PricingBreakdownResponse
from app.services.pricing_service import (
    calculate_total_route_distance_km,
    estimate_duration_minutes,
    compute_pricing_breakdown
)

router = APIRouter(prefix="/pricing", tags=["Pricing Engine"])

@router.post("/calculate", response_model=PricingBreakdownResponse)
async def calculate_pricing(payload: PricingCalculateRequest):
    db = get_database()
    
    # 1. Fetch theme
    theme_query = {"slug": payload.theme_id}
    if ObjectId.is_valid(payload.theme_id):
        theme_query = {"$or": [{"_id": ObjectId(payload.theme_id)}, {"slug": payload.theme_id}]}
    
    theme = await db.themes.find_one(theme_query)
    if not theme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theme not found for pricing calculation.")

    base_price = float(theme.get("base_price_inr", 2999.0))
    included_km = float(theme.get("included_km", 10.0))
    per_km_rate = float(theme.get("per_km_rate_inr", 8.0))

    # 2. Calculate distance
    stop_lat = payload.optional_stop.lat if payload.optional_stop else None
    stop_lng = payload.optional_stop.lng if payload.optional_stop else None
    
    distance_km = calculate_total_route_distance_km(
        payload.pickup.lat, payload.pickup.lng,
        payload.destination.lat, payload.destination.lng,
        stop_lat, stop_lng
    )
    duration_min = estimate_duration_minutes(distance_km)

    # 3. Sum add-ons
    add_ons_total = 0.0
    theme_addons_map = {a.get("name"): float(a.get("price_inr", 0.0)) for a in theme.get("add_ons", [])}
    for addon in payload.selected_add_ons:
        price = addon.price_inr or theme_addons_map.get(addon.name, 0.0)
        add_ons_total += float(price)

    # 4. Sum menu items
    menu_total = 0.0
    if payload.menu_items:
        item_ids = []
        for m in payload.menu_items:
            if ObjectId.is_valid(m.item_id):
                item_ids.append(ObjectId(m.item_id))
            else:
                item_ids.append(m.item_id)
        
        cursor = db.menu_items.find({"_id": {"$in": item_ids}})
        items_in_db = await cursor.to_list(length=100)
        price_map = {str(item["_id"]): float(item.get("price_inr", 0.0)) for item in items_in_db}
        
        for m in payload.menu_items:
            unit_price = price_map.get(m.item_id, 0.0)
            menu_total += unit_price * m.quantity

    # 5. Check discount promo code
    discount_amount = 0.0
    applied_offer = None
    if payload.promo_code:
        code_clean = payload.promo_code.strip().upper()
        offer = await db.offers.find_one({"code": code_clean, "is_active": True})
        if offer:
            sub_check = base_price + add_ons_total + menu_total
            if sub_check >= float(offer.get("min_order_value_inr", 0.0)):
                disc_type = offer.get("discount_type", "percentage")
                disc_val = float(offer.get("value", 0.0))
                max_disc = float(offer.get("max_discount_inr", 999999.0) or 999999.0)
                
                if disc_type == "percentage":
                    calculated_disc = (sub_check * (disc_val / 100.0))
                    discount_amount = min(calculated_disc, max_disc)
                else:
                    discount_amount = min(disc_val, max_disc)
                applied_offer = code_clean

    breakdown = compute_pricing_breakdown(
        base_price_inr=base_price,
        distance_km=distance_km,
        included_km=included_km,
        per_km_rate_inr=per_km_rate,
        add_ons_total_inr=add_ons_total,
        menu_total_inr=menu_total,
        discount_amount_inr=discount_amount
    )

    return PricingBreakdownResponse(
        distance_km=distance_km,
        estimated_duration_min=duration_min,
        base_price_inr=breakdown["base_price_inr"],
        included_km=breakdown["included_km"],
        extra_km=breakdown["extra_km"],
        per_km_rate_inr=breakdown["per_km_rate_inr"],
        extra_km_charge_inr=breakdown["extra_km_charge_inr"],
        add_ons_total_inr=breakdown["add_ons_total_inr"],
        menu_total_inr=breakdown["menu_total_inr"],
        subtotal_inr=breakdown["subtotal_inr"],
        discount_inr=breakdown["discount_inr"],
        tax_inr=breakdown["tax_inr"],
        total_inr=breakdown["total_inr"],
        applied_offer_code=applied_offer
    )
