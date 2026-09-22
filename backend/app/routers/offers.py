from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_database
from app.core.security import require_roles
from app.models.offer import OfferCreate, OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers & Promotions"])

def format_offer_doc(doc: dict) -> OfferResponse:
    doc_id = str(doc.get("_id"))
    doc_copy = doc.copy()
    doc_copy["id"] = doc_id
    if "_id" in doc_copy:
        del doc_copy["_id"]
    return OfferResponse(**doc_copy)

@router.get("", response_model=List[OfferResponse])
async def list_offers(active_only: bool = Query(True)):
    db = get_database()
    query = {"is_active": True} if active_only else {}
    cursor = db.offers.find(query)
    docs = await cursor.to_list(length=50)
    return [format_offer_doc(doc) for doc in docs]

@router.post("/validate")
async def validate_promo_code(code: str = Query(...), amount: float = Query(...)):
    db = get_database()
    code_upper = code.strip().upper()
    offer = await db.offers.find_one({"code": code_upper, "is_active": True})
    if not offer:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code.")

    min_val = float(offer.get("min_order_value_inr", 0.0))
    if amount < min_val:
        raise HTTPException(
            status_code=400,
            detail=f"Promo code requires minimum order value of ₹{min_val:,.0f}."
        )

    disc_type = offer.get("discount_type", "percentage")
    disc_val = float(offer.get("value", 0.0))
    max_disc = float(offer.get("max_discount_inr", 999999.0) or 999999.0)

    if disc_type == "percentage":
        discount = min(amount * (disc_val / 100.0), max_disc)
    else:
        discount = min(disc_val, max_disc)

    return {
        "valid": True,
        "code": code_upper,
        "discount_inr": round(discount, 2),
        "description": offer.get("description", ""),
        "final_amount": max(0.0, round(amount - discount, 2))
    }

@router.post("", response_model=OfferResponse)
async def create_offer(
    payload: OfferCreate,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    existing = await db.offers.find_one({"code": payload.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Offer with this code already exists.")
    
    data = payload.dict()
    data["code"] = data["code"].upper()
    data["created_at"] = datetime.now(timezone.utc)
    res = await db.offers.insert_one(data)
    data["_id"] = res.inserted_id
    return format_offer_doc(data)

@router.delete("/{offer_id}")
async def delete_offer(
    offer_id: str,
    admin_payload: dict = Depends(require_roles("admin"))
):
    db = get_database()
    query = {"_id": ObjectId(offer_id)} if ObjectId.is_valid(offer_id) else {"_id": offer_id}
    res = await db.offers.delete_one(query)
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found.")
    return {"status": "success", "message": "Offer removed."}
