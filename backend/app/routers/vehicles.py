from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_database
from app.core.security import require_roles
from app.models.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

def format_vehicle_doc(doc: dict) -> VehicleResponse:
    doc_id = str(doc.get("_id"))
    doc_copy = doc.copy()
    doc_copy["id"] = doc_id
    if "_id" in doc_copy:
        del doc_copy["_id"]
    return VehicleResponse(**doc_copy)

@router.get("", response_model=List[VehicleResponse])
async def list_vehicles(status_filter: Optional[str] = Query(None)):
    db = get_database()
    query = {"is_active": True}
    if status_filter:
        query["status"] = status_filter
    cursor = db.vehicles.find(query)
    docs = await cursor.to_list(length=100)
    return [format_vehicle_doc(doc) for doc in docs]

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str):
    db = get_database()
    query = {"_id": ObjectId(vehicle_id)} if ObjectId.is_valid(vehicle_id) else {"_id": vehicle_id}
    doc = await db.vehicles.find_one(query)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    return format_vehicle_doc(doc)

@router.post("", response_model=VehicleResponse)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    data = vehicle_in.dict()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)
    result = await db.vehicles.insert_one(data)
    data["_id"] = result.inserted_id
    return format_vehicle_doc(data)

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_in: VehicleUpdate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(vehicle_id)} if ObjectId.is_valid(vehicle_id) else {"_id": vehicle_id}
    update_data = {k: v for k, v in vehicle_in.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    res = await db.vehicles.update_one(query, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    
    updated = await db.vehicles.find_one(query)
    return format_vehicle_doc(updated)

@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(vehicle_id)} if ObjectId.is_valid(vehicle_id) else {"_id": vehicle_id}
    res = await db.vehicles.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    return {"status": "success", "message": "Vehicle deleted."}
