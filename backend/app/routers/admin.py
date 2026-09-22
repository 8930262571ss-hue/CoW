from datetime import datetime
from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.core.security import require_roles

router = APIRouter(prefix="/admin", tags=["Admin Aggregations"])

@router.get("/dashboard-stats")
async def get_dashboard_stats(admin_payload: dict = Depends(require_roles("admin"))):
    db = get_database()
    
    # 1. Total bookings & count by status
    bookings_cursor = db.bookings.find({})
    bookings = await bookings_cursor.to_list(length=1000)

    total_bookings = len(bookings)
    completed_rides = sum(1 for b in bookings if b.get("status") == "completed")
    in_progress_rides = sum(1 for b in bookings if b.get("status") == "in_progress")
    confirmed_rides = sum(1 for b in bookings if b.get("status") == "confirmed")
    pending_rides = sum(1 for b in bookings if b.get("status") == "pending_payment")

    # 2. Total revenue (from confirmed and completed bookings)
    total_revenue_inr = sum(
        b.get("pricing", {}).get("total_inr", 0.0)
        for b in bookings
        if b.get("status") in ("confirmed", "in_progress", "completed")
    )

    # 3. Active vans count
    vans_count = await db.vehicles.count_documents({"is_active": True})
    available_vans = await db.vehicles.count_documents({"status": "available", "is_active": True})
    on_ride_vans = await db.vehicles.count_documents({"status": "on_ride", "is_active": True})

    # 4. Themes count
    themes_count = await db.themes.count_documents({"is_active": True})
    menu_items_count = await db.menu_items.count_documents({"is_available": True})

    # 5. Recent 10 bookings
    recent_bookings = []
    for b in sorted(bookings, key=lambda x: x.get("created_at") or datetime.min, reverse=True)[:10]:
        recent_bookings.append({
            "id": str(b.get("_id")),
            "theme_name": b.get("theme_name", ""),
            "pickup": b.get("pickup_location", {}).get("address", ""),
            "destination": b.get("destination", {}).get("address", ""),
            "date": b.get("scheduled_date", ""),
            "time_slot": b.get("scheduled_time_slot", ""),
            "status": b.get("status", ""),
            "total_inr": b.get("pricing", {}).get("total_inr", 0.0),
            "created_at": b.get("created_at").isoformat() if b.get("created_at") else None
        })

    return {
        "total_revenue_inr": round(total_revenue_inr, 2),
        "total_bookings": total_bookings,
        "completed_rides": completed_rides,
        "in_progress_rides": in_progress_rides,
        "confirmed_rides": confirmed_rides,
        "pending_rides": pending_rides,
        "fleet": {
            "total_vans": vans_count,
            "available_vans": available_vans,
            "on_ride_vans": on_ride_vans
        },
        "themes_count": themes_count,
        "menu_items_count": menu_items_count,
        "recent_bookings": recent_bookings
    }
