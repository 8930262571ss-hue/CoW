import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Set
from fastapi import WebSocket
from app.services.pricing_service import calculate_haversine_distance_km, estimate_duration_minutes
from app.core.database import get_database

logger = logging.getLogger("cafe_on_wheels.ws")

class RideConnectionManager:
    def __init__(self):
        # Maps booking_id to a set of customer WebSockets
        self.active_customer_connections: Dict[str, Set[WebSocket]] = {}
        # Maps booking_id to a driver WebSocket (if connected)
        self.active_driver_connections: Dict[str, WebSocket] = {}

    async def connect_customer(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        if booking_id not in self.active_customer_connections:
            self.active_customer_connections[booking_id] = set()
        self.active_customer_connections[booking_id].add(websocket)
        logger.info(f"Customer connected to live tracking for booking {booking_id}")

        # Immediately send the latest tracking snapshot to the customer
        db = get_database()
        if db is not None:
            latest = await db.ride_tracking.find_one({"booking_id": booking_id}, sort=[("updated_at", -1)])
            if latest:
                latest["_id"] = str(latest["_id"])
                if "updated_at" in latest and isinstance(latest["updated_at"], datetime):
                    latest["updated_at"] = latest["updated_at"].isoformat()
                await websocket.send_text(json.dumps({
                    "type": "SNAPSHOT",
                    "data": latest
                }))

    def disconnect_customer(self, websocket: WebSocket, booking_id: str):
        if booking_id in self.active_customer_connections:
            self.active_customer_connections[booking_id].discard(websocket)
            if not self.active_customer_connections[booking_id]:
                del self.active_customer_connections[booking_id]
        logger.info(f"Customer disconnected from booking {booking_id}")

    async def connect_driver(self, websocket: WebSocket, booking_id: str):
        await websocket.accept()
        self.active_driver_connections[booking_id] = websocket
        logger.info(f"Driver connected for booking {booking_id}")
        await websocket.send_text(json.dumps({
            "type": "DRIVER_ACK",
            "message": f"Connected as driver for booking {booking_id}"
        }))

    def disconnect_driver(self, websocket: WebSocket, booking_id: str):
        if self.active_driver_connections.get(booking_id) == websocket:
            del self.active_driver_connections[booking_id]
        logger.info(f"Driver disconnected from booking {booking_id}")

    async def handle_driver_location_update(self, booking_id: str, payload: dict):
        """
        Process GPS update from driver:
        1. Calculate distance remaining to destination and progress %
        2. Update DB ride_tracking
        3. Broadcast live location + progress + ETA to all connected customers
        """
        db = get_database()
        lat = float(payload.get("lat", 0.0))
        lng = float(payload.get("lng", 0.0))
        heading = float(payload.get("heading", 0.0))
        speed_kmh = float(payload.get("speed_kmh", 0.0))

        # Retrieve booking to check pickup and destination
        destination_lat = lat
        destination_lng = lng
        initial_distance_km = 10.0
        booking_status = "in_progress"

        if db is not None:
            booking = await db.bookings.find_one({"_id": booking_id})
            if not booking:
                # Try with ObjectId or string
                from bson import ObjectId
                try:
                    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
                except Exception:
                    pass
            if booking:
                dest = booking.get("destination", {})
                pickup = booking.get("pickup_location", {})
                destination_lat = dest.get("lat", lat)
                destination_lng = dest.get("lng", lng)
                initial_distance_km = booking.get("estimated_distance_km", 10.0)
                booking_status = booking.get("status", "in_progress")

        remaining_km = calculate_haversine_distance_km(lat, lng, destination_lat, destination_lng)
        eta_minutes = estimate_duration_minutes(remaining_km)
        
        # Calculate progress
        if initial_distance_km > 0:
            covered = max(0.0, initial_distance_km - remaining_km)
            progress_percent = min(100.0, max(0.0, round((covered / initial_distance_km) * 100, 1)))
        else:
            progress_percent = 50.0

        if remaining_km <= 0.1:
            ride_status = "arrived"
            progress_percent = 100.0
        else:
            ride_status = "en_route"

        tracking_data = {
            "booking_id": booking_id,
            "driver_location": {
                "lat": lat,
                "lng": lng,
                "heading": heading,
                "speed_kmh": speed_kmh,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "remaining_distance_km": remaining_km,
            "eta_minutes": eta_minutes,
            "progress_percent": progress_percent,
            "status": ride_status,
            "updated_at": datetime.now(timezone.utc)
        }

        # Persist to database
        if db is not None:
            await db.ride_tracking.update_one(
                {"booking_id": booking_id},
                {"$set": tracking_data},
                upsert=True
            )

        # Broadcast to all customers for this booking
        await self.broadcast_to_customers(booking_id, {
            "type": "LOCATION_UPDATE",
            "data": {
                **tracking_data,
                "updated_at": tracking_data["updated_at"].isoformat()
            }
        })

    async def broadcast_to_customers(self, booking_id: str, message_dict: dict):
        if booking_id in self.active_customer_connections:
            message_text = json.dumps(message_dict)
            closed_sockets = set()
            for ws in self.active_customer_connections[booking_id]:
                try:
                    await ws.send_text(message_text)
                except Exception:
                    closed_sockets.add(ws)
            for ws in closed_sockets:
                self.active_customer_connections[booking_id].discard(ws)

ws_manager = RideConnectionManager()
