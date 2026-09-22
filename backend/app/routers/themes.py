from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_database
from app.core.security import require_roles
from app.models.theme import ThemeCreate, ThemeUpdate, ThemeResponse

router = APIRouter(prefix="/themes", tags=["Themes"])

def format_theme_doc(doc: dict) -> ThemeResponse:
    doc_id = str(doc.get("_id"))
    doc_copy = doc.copy()
    doc_copy["id"] = doc_id
    if "_id" in doc_copy:
        del doc_copy["_id"]
    return ThemeResponse(**doc_copy)

@router.get("", response_model=List[ThemeResponse])
async def list_themes(
    mood: Optional[str] = Query(None, description="Filter by mood tag"),
    active_only: bool = Query(True)
):
    db = get_database()
    query = {}
    if active_only:
        query["is_active"] = True
    if mood and mood != "all":
        query["mood_tags"] = mood.lower()

    cursor = db.themes.find(query).sort("base_price_inr", 1)
    docs = await cursor.to_list(length=100)
    return [format_theme_doc(doc) for doc in docs]

@router.get("/{identifier}", response_model=ThemeResponse)
async def get_theme(identifier: str):
    db = get_database()
    query = {"slug": identifier}
    if ObjectId.is_valid(identifier):
        query = {"$or": [{"_id": ObjectId(identifier)}, {"slug": identifier}]}
    
    theme = await db.themes.find_one(query)
    if not theme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theme not found.")
    return format_theme_doc(theme)

@router.post("", response_model=ThemeResponse)
async def create_theme(
    theme_in: ThemeCreate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    existing = await db.themes.find_one({"slug": theme_in.slug})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A theme with this slug already exists.")

    theme_dict = theme_in.dict()
    theme_dict["created_at"] = datetime.now(timezone.utc)
    theme_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.themes.insert_one(theme_dict)
    theme_dict["_id"] = result.inserted_id
    return format_theme_doc(theme_dict)

@router.put("/{theme_id}", response_model=ThemeResponse)
async def update_theme(
    theme_id: str,
    theme_in: ThemeUpdate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(theme_id)} if ObjectId.is_valid(theme_id) else {"_id": theme_id}
    
    update_data = {k: v for k, v in theme_in.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.themes.update_one(query, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theme not found.")
    
    updated = await db.themes.find_one(query)
    return format_theme_doc(updated)

@router.delete("/{theme_id}")
async def delete_theme(
    theme_id: str,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(theme_id)} if ObjectId.is_valid(theme_id) else {"_id": theme_id}
    result = await db.themes.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Theme not found.")
    return {"status": "success", "message": "Theme removed."}
