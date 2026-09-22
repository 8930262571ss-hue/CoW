from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_database
from app.core.security import require_roles
from app.models.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter(prefix="/menu", tags=["Menu"])

CATEGORIES = [
    "Coffee & Beverages",
    "Bakery & Desserts",
    "Breakfast",
    "Full Meals",
    "Regional Cuisine",
    "Vegan/Vegetarian",
    "Kids Menu"
]

def format_menu_doc(doc: dict) -> MenuItemResponse:
    doc_id = str(doc.get("_id"))
    doc_copy = doc.copy()
    doc_copy["id"] = doc_id
    if "_id" in doc_copy:
        del doc_copy["_id"]
    return MenuItemResponse(**doc_copy)

@router.get("/categories", response_model=List[str])
async def list_categories():
    return CATEGORIES

@router.get("", response_model=List[MenuItemResponse])
async def list_menu_items(
    category: Optional[str] = Query(None),
    is_veg: Optional[bool] = Query(None),
    available_only: bool = Query(True)
):
    db = get_database()
    query = {}
    if available_only:
        query["is_available"] = True
    if category and category != "All":
        query["category"] = category
    if is_veg is not None:
        query["is_veg"] = is_veg

    cursor = db.menu_items.find(query).sort("price_inr", 1)
    docs = await cursor.to_list(length=200)
    return [format_menu_doc(doc) for doc in docs]

@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str):
    db = get_database()
    query = {"_id": ObjectId(item_id)} if ObjectId.is_valid(item_id) else {"_id": item_id}
    doc = await db.menu_items.find_one(query)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
    return format_menu_doc(doc)

@router.post("", response_model=MenuItemResponse)
async def create_menu_item(
    item_in: MenuItemCreate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    data = item_in.dict()
    data["created_at"] = datetime.now(timezone.utc)
    data["updated_at"] = datetime.now(timezone.utc)
    res = await db.menu_items.insert_one(data)
    data["_id"] = res.inserted_id
    return format_menu_doc(data)

@router.put("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: str,
    item_in: MenuItemUpdate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(item_id)} if ObjectId.is_valid(item_id) else {"_id": item_id}
    update_data = {k: v for k, v in item_in.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    res = await db.menu_items.update_one(query, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
    
    updated = await db.menu_items.find_one(query)
    return format_menu_doc(updated)

@router.delete("/{item_id}")
async def delete_menu_item(
    item_id: str,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(item_id)} if ObjectId.is_valid(item_id) else {"_id": item_id}
    res = await db.menu_items.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found.")
    return {"status": "success", "message": "Menu item deleted."}
