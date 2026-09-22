from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_database
from app.core.security import get_current_user_payload
from app.models.booking import (
    BookingCreate, BookingStatusUpdate, BookingResponse, BookingPricing, BookingMenuItem
)
from app.models.pricing import PricingCalculateRequest, GeoPointInput, SelectedAddOnInput, SelectedMenuItemInput
from app.routers.pricing import calculate_pricing

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def format_booking_doc(doc: dict) -> BookingResponse:
    doc_id = str(doc.get("_id"))
    doc_copy = doc.copy()
    doc_copy["id"] = doc_id
    if "_id" in doc_copy:
        del doc_copy["_id"]
    return BookingResponse(**doc_copy)

@router.post("", response_model=BookingResponse)
async def create_booking(
    payload: BookingCreate,
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    user_id = user_payload.get("sub")

    # Fetch theme
    theme_query = {"slug": payload.theme_id}
    if ObjectId.is_valid(payload.theme_id):
        theme_query = {"$or": [{"_id": ObjectId(payload.theme_id)}, {"slug": payload.theme_id}]}
    theme = await db.themes.find_one(theme_query)
    if not theme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theme not found.")

    # Calculate authoritative pricing on backend
    pricing_req = PricingCalculateRequest(
        theme_id=str(theme["_id"]),
        pickup=payload.pickup_location,
        destination=payload.destination,
        optional_stop=payload.optional_stop,
        selected_add_ons=payload.selected_add_ons,
        menu_items=[SelectedMenuItemInput(item_id=str(m.get("item_id")), quantity=int(m.get("quantity", 1))) for m in payload.menu_items],
        promo_code=payload.promo_code
    )
    breakdown = await calculate_pricing(pricing_req)

    # Format booking menu items
    menu_items_for_booking = []
    if payload.menu_items:
        m_ids = [ObjectId(m["item_id"]) if ObjectId.is_valid(m["item_id"]) else m["item_id"] for m in payload.menu_items]
        db_menu = await db.menu_items.find({"_id": {"$in": m_ids}}).to_list(length=100)
        menu_map = {str(item["_id"]): item for item in db_menu}
        for m in payload.menu_items:
            item_id_str = str(m.get("item_id"))
            item_doc = menu_map.get(item_id_str, {})
            menu_items_for_booking.append({
                "item_id": item_id_str,
                "name": item_doc.get("name", m.get("name", "Artisanal Item")),
                "quantity": int(m.get("quantity", 1)),
                "price_at_booking": float(item_doc.get("price_inr", m.get("price_inr", 0.0)))
            })

    # Pick an available vehicle if none specified
    vehicle_id = payload.vehicle_id
    if not vehicle_id:
        avail_van = await db.vehicles.find_one({"status": "available", "is_active": True})
        if avail_van:
            vehicle_id = str(avail_van["_id"])

    booking_doc = {
        "user_id": user_id,
        "theme_id": str(theme["_id"]),
        "theme_name": theme.get("name", "Themed Experience"),
        "theme_image": theme.get("hero_images", [""])[0] if theme.get("hero_images") else "",
        "selected_add_ons": [a.dict() for a in payload.selected_add_ons],
        "menu_items": menu_items_for_booking,
        "pickup_location": payload.pickup_location.dict(),
        "destination": payload.destination.dict(),
        "optional_stop": payload.optional_stop.dict() if payload.optional_stop else None,
        "estimated_distance_km": breakdown.distance_km,
        "estimated_duration_min": breakdown.estimated_duration_min,
        "guest_count": payload.guest_count,
        "scheduled_date": payload.scheduled_date,
        "scheduled_time_slot": payload.scheduled_time_slot,
        "vehicle_id": vehicle_id,
        "driver_id": None,
        "pricing": {
            "base_price_inr": breakdown.base_price_inr,
            "distance_km": breakdown.distance_km,
            "extra_km_charge_inr": breakdown.extra_km_charge_inr,
            "add_ons_total_inr": breakdown.add_ons_total_inr,
            "menu_total_inr": breakdown.menu_total_inr,
            "tax_inr": breakdown.tax_inr,
            "discount_inr": breakdown.discount_inr,
            "total_inr": breakdown.total_inr
        },
        "status": "pending_payment",
        "special_requests": payload.special_requests or "",
        "payment_id": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = await db.bookings.insert_one(booking_doc)
    booking_doc["_id"] = result.inserted_id

    # Initialize ride_tracking record for this booking
    await db.ride_tracking.insert_one({
        "booking_id": str(result.inserted_id),
        "driver_location": {
            "lat": payload.pickup_location.lat,
            "lng": payload.pickup_location.lng,
            "heading": 0.0,
            "speed_kmh": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        "remaining_distance_km": breakdown.distance_km,
        "eta_minutes": breakdown.estimated_duration_min,
        "progress_percent": 0.0,
        "status": "not_started",
        "updated_at": datetime.now(timezone.utc)
    })

    return format_booking_doc(booking_doc)

@router.get("", response_model=List[BookingResponse])
async def list_bookings(
    status_filter: Optional[str] = Query(None),
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    role = user_payload.get("role", "customer")
    user_id = user_payload.get("sub")

    query = {}
    if role != "admin":
        query["user_id"] = user_id
    if status_filter:
        query["status"] = status_filter

    cursor = db.bookings.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [format_booking_doc(doc) for doc in docs]

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
    doc = await db.bookings.find_one(query)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    # Check permission
    role = user_payload.get("role", "customer")
    if role != "admin" and doc.get("user_id") != user_payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return format_booking_doc(doc)

@router.patch("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    payload: BookingStatusUpdate,
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
    
    update_fields = {
        "status": payload.status,
        "updated_at": datetime.now(timezone.utc)
    }
    if payload.driver_id:
        update_fields["driver_id"] = payload.driver_id
    if payload.vehicle_id:
        update_fields["vehicle_id"] = payload.vehicle_id

    res = await db.bookings.update_one(query, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    
    updated = await db.bookings.find_one(query)
    return format_booking_doc(updated)

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
    doc = await db.bookings.find_one(query)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if doc.get("status") in ("completed", "cancelled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel booking in '{doc.get('status')}' status.")

    await db.bookings.update_one(query, {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}})
    updated = await db.bookings.find_one(query)
    return format_booking_doc(updated)
