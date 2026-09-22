import json
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, status, Depends
from app.core.database import get_database
from app.core.security import decode_token
from app.ws.connection_manager import ws_manager
from app.models.ride import DriverLocationUpdate, RideTrackingState

router = APIRouter(prefix="/rides", tags=["Rides & Live Tracking"])

@router.get("/tracking/{booking_id}")
async def get_ride_tracking(booking_id: str):
    db = get_database()
    track_doc = await db.ride_tracking.find_one({"booking_id": booking_id})
    if not track_doc:
        # Fallback to booking's pickup location
        b_query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
        booking = await db.bookings.find_one(b_query)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")
        pickup = booking.get("pickup_location", {"lat": 19.0596, "lng": 72.8295})
        return {
            "booking_id": booking_id,
            "driver_location": {
                "lat": pickup.get("lat", 19.0596),
                "lng": pickup.get("lng", 72.8295),
                "heading": 0.0,
                "speed_kmh": 0.0,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "remaining_distance_km": booking.get("estimated_distance_km", 10.0),
            "eta_minutes": booking.get("estimated_duration_min", 35),
            "progress_percent": 0.0,
            "status": "not_started"
        }
    
    track_doc["_id"] = str(track_doc["_id"])
    if "updated_at" in track_doc and isinstance(track_doc["updated_at"], datetime):
        track_doc["updated_at"] = track_doc["updated_at"].isoformat()
    return track_doc

@router.post("/driver/ping/{booking_id}")
async def push_driver_ping_rest(booking_id: str, payload: DriverLocationUpdate):
    """REST fallback for driver GPS pings in addition to WebSocket."""
    await ws_manager.handle_driver_location_update(booking_id, payload.dict())
    return {"status": "ok", "message": "Location updated and broadcasted."}

@router.websocket("/ws/{booking_id}")
async def websocket_ride_tracking(
    websocket: WebSocket,
    booking_id: str,
    client_type: str = Query("customer"),
    token: str = Query(None)
):
    """
    Real-time GPS ride tracking WebSocket:
    - client_type="customer": Subscribes to live broadcasts
    - client_type="driver": Pushes periodic GPS coordinate updates
    """
    if client_type == "driver":
        # Connect driver
        await ws_manager.connect_driver(websocket, booking_id)
        try:
            while True:
                data_text = await websocket.receive_text()
                try:
                    payload = json.loads(data_text)
                    await ws_manager.handle_driver_location_update(booking_id, payload)
                except Exception as ex:
                    await websocket.send_text(json.dumps({"error": f"Invalid payload: {str(ex)}"}))
        except WebSocketDisconnect:
            ws_manager.disconnect_driver(websocket, booking_id)
    else:
        # Connect customer
        await ws_manager.connect_customer(websocket, booking_id)
        try:
            while True:
                # Keep alive ping-pong
                msg = await websocket.receive_text()
                if msg == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            ws_manager.disconnect_customer(websocket, booking_id)
