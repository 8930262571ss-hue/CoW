import hashlib
import uuid
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from app.core.config import settings
from app.core.database import get_database
from app.core.security import get_current_user_payload
from app.models.payment import PayUInitiateRequest, PayUInitiateResponse

router = APIRouter(prefix="/payments", tags=["Payments (PayU)"])

def generate_payu_request_hash(key: str, txnid: str, amount: str, productinfo: str, firstname: str, email: str, salt: str, udf1: str = "") -> str:
    hash_sequence = f"{key}|{txnid}|{amount}|{productinfo}|{firstname}|{email}|{udf1}|||||||||{salt}"
    return hashlib.sha512(hash_sequence.encode("utf-8")).hexdigest().lower()

def verify_payu_response_hash(params: dict, salt: str) -> bool:
    received_hash = params.get("hash", "").lower()
    key = params.get("key", settings.PAYU_MERCHANT_KEY)
    txnid = params.get("txnid", "")
    amount = params.get("amount", "")
    productinfo = params.get("productinfo", "")
    firstname = params.get("firstname", "")
    email = params.get("email", "")
    status_val = params.get("status", "")
    udf1 = params.get("udf1", "")

    # Reverse hash sequence
    hash_sequence = f"{salt}|{status_val}|||||||||{udf1}|{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    calculated_hash = hashlib.sha512(hash_sequence.encode("utf-8")).hexdigest().lower()
    return calculated_hash == received_hash

@router.post("/payu/initiate", response_model=PayUInitiateResponse)
async def initiate_payu_payment(
    payload: PayUInitiateRequest,
    user_payload: dict = Depends(get_current_user_payload)
):
    db = get_database()
    booking_id = payload.booking_id
    query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
    
    booking = await db.bookings.find_one(query)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking.get("status") == "confirmed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is already paid and confirmed.")

    user_id = user_payload.get("sub")
    user_query = {"_id": ObjectId(user_id)} if ObjectId.is_valid(user_id) else {"_id": user_id}
    user = await db.users.find_one(user_query) or {}

    amount_str = f"{booking['pricing']['total_inr']:.2f}"
    txn_id = f"COW-{uuid.uuid4().hex[:10].upper()}"
    product_info = f"Theme: {booking.get('theme_name', 'Cafe on Wheels')}"
    firstname = user.get("name", "Valued Guest").split()[0]
    email = user.get("email", "guest@cafeonwheels.com")
    phone = user.get("phone", "9876543210")

    payu_hash = generate_payu_request_hash(
        key=settings.PAYU_MERCHANT_KEY,
        txnid=txn_id,
        amount=amount_str,
        productinfo=product_info,
        firstname=firstname,
        email=email,
        salt=settings.PAYU_MERCHANT_SALT,
        udf1=str(booking["_id"])
    )

    # Record initiated payment in payments collection
    payment_doc = {
        "booking_id": str(booking["_id"]),
        "user_id": user_id,
        "gateway": "payu",
        "payu_txn_id": txn_id,
        "amount_inr": booking["pricing"]["total_inr"],
        "status": "initiated",
        "raw_gateway_response": {},
        "created_at": datetime.now(timezone.utc)
    }
    pay_res = await db.payments.insert_one(payment_doc)

    # PayU parameters
    params = {
        "key": settings.PAYU_MERCHANT_KEY,
        "txnid": txn_id,
        "amount": amount_str,
        "productinfo": product_info,
        "firstname": firstname,
        "email": email,
        "phone": phone,
        "surl": f"{settings.FRONTEND_URL}/checkout?status=success&bookingId={booking['_id']}&txnid={txn_id}",
        "furl": f"{settings.FRONTEND_URL}/checkout?status=failed&bookingId={booking['_id']}&txnid={txn_id}",
        "hash": payu_hash,
        "udf1": str(booking["_id"])
    }

    return PayUInitiateResponse(
        payment_id=str(pay_res.inserted_id),
        booking_id=str(booking["_id"]),
        action_url=settings.PAYU_BASE_URL,
        is_simulated=settings.PAYU_SIMULATED_MODE,
        params=params
    )

@router.post("/payu/callback")
async def payu_callback(request: Request):
    """
    PayU webhook / callback endpoint called by PayU gateway upon payment completion.
    """
    db = get_database()
    form_data = await request.form()
    data = dict(form_data)

    txnid = data.get("txnid")
    status_str = data.get("status", "failure").lower()
    booking_id = data.get("udf1")

    # In production, verify the response hash
    is_valid = True
    if not settings.PAYU_SIMULATED_MODE:
        is_valid = verify_payu_response_hash(data, settings.PAYU_MERCHANT_SALT)

    if not is_valid:
        return HTMLResponse("<h3>Invalid payment hash signature</h3>", status_code=400)

    # Update payment record
    if txnid:
        await db.payments.update_one(
            {"payu_txn_id": txnid},
            {
                "$set": {
                    "status": "success" if status_str == "success" else "failed",
                    "raw_gateway_response": data,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

    # If success, update booking status to confirmed
    if status_str == "success" and booking_id:
        b_query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
        await db.bookings.update_one(
            b_query,
            {
                "$set": {
                    "status": "confirmed",
                    "payment_id": txnid,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/ride/{booking_id}/track?payment=success",
            status_code=303
        )

    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/checkout?status=failed&bookingId={booking_id}",
        status_code=303
    )

@router.post("/simulate-success/{booking_id}")
async def simulate_payment_success(
    booking_id: str,
    user_payload: dict = Depends(get_current_user_payload)
):
    """
    Direct endpoint to simulate instantaneous payment confirmation for testing without PayU merchant account.
    """
    db = get_database()
    query = {"_id": ObjectId(booking_id)} if ObjectId.is_valid(booking_id) else {"_id": booking_id}
    booking = await db.bookings.find_one(query)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    mock_txn_id = f"SIM-PAYU-{uuid.uuid4().hex[:8].upper()}"
    
    # Update payment or insert payment record
    await db.payments.insert_one({
        "booking_id": str(booking["_id"]),
        "user_id": user_payload.get("sub"),
        "gateway": "payu-simulated",
        "payu_txn_id": mock_txn_id,
        "amount_inr": booking["pricing"]["total_inr"],
        "status": "success",
        "raw_gateway_response": {"simulated": True, "mode": "sandbox"},
        "created_at": datetime.now(timezone.utc)
    })

    # Update booking to confirmed
    await db.bookings.update_one(
        query,
        {
            "$set": {
                "status": "confirmed",
                "payment_id": mock_txn_id,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return {
        "status": "success",
        "message": "Simulated PayU payment confirmed successfully.",
        "booking_id": str(booking["_id"]),
        "txn_id": mock_txn_id
    }
