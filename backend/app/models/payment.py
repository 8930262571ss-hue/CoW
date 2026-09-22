from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class PayUInitiateRequest(BaseModel):
    booking_id: str

class PayUInitiateResponse(BaseModel):
    payment_id: str
    booking_id: str
    action_url: str
    is_simulated: bool
    params: Dict[str, str]

class PayUCallbackPayload(BaseModel):
    txnid: str
    amount: str
    productinfo: str
    firstname: str
    email: str
    status: str
    hash: str
    key: str
    udf1: Optional[str] = ""
    error_Message: Optional[str] = None
    bank_ref_num: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    user_id: str
    gateway: str = "payu"
    payu_txn_id: str
    amount_inr: float
    status: str  # "initiated" | "success" | "failed" | "refunded"
    created_at: Optional[datetime] = None
