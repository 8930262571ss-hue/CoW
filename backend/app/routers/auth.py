from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_database
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_current_user_payload
)
from app.models.user import (
    UserRegister, UserLogin, UserResponse, TokenResponse, UserPreferences
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_doc(doc: dict) -> UserResponse:
    return UserResponse(
        id=str(doc.get("_id")),
        name=doc.get("name", ""),
        email=doc.get("email", ""),
        phone=doc.get("phone", ""),
        role=doc.get("role", "customer"),
        saved_themes=doc.get("saved_themes", []),
        saved_payment_methods=doc.get("saved_payment_methods", []),
        preferences=UserPreferences(**doc.get("preferences", {})),
        created_at=doc.get("created_at")
    )

@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister):
    db = get_database()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "password_hash": hash_password(payload.password),
        "role": payload.role if payload.role in ("customer", "admin", "driver") else "customer",
        "saved_themes": [],
        "saved_payment_methods": [],
        "preferences": {
            "favorite_cuisines": [],
            "favorite_moods": [],
            "notify_weather": True,
            "notify_events": True,
            "notify_day": True
        },
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token_data = {"sub": str(result.inserted_id), "email": user_doc["email"], "role": user_doc["role"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=format_user_doc(user_doc)
    )

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token_data = {"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "customer")}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=format_user_doc(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(payload: dict = Depends(get_current_user_payload)):
    db = get_database()
    user_id = payload.get("sub")
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return format_user_doc(user)

@router.patch("/preferences", response_model=UserResponse)
async def update_preferences(
    preferences: UserPreferences,
    payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    user_id = payload.get("sub")
    query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"_id": user_id}
    
    await db.users.update_one(query, {"$set": {"preferences": preferences.dict()}})
    updated = await db.users.find_one(query)
    return format_user_doc(updated)

@router.post("/saved-themes/{theme_id}")
async def toggle_saved_theme(
    theme_id: str,
    payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    user_id = payload.get("sub")
    query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"_id": user_id}
    user = await db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    saved = user.get("saved_themes", [])
    if theme_id in saved:
        saved.remove(theme_id)
        action = "removed"
    else:
        saved.append(theme_id)
        action = "added"
    
    await db.users.update_one(query, {"$set": {"saved_themes": saved}})
    return {"status": "success", "action": action, "saved_themes": saved}
