from fastapi import APIRouter, Depends, HTTPException, Request, Header
from dodopayments import DodoPayments
from .auth import current_active_user
from .db import User
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])

# Initialize Dodo client - in production use env vars
DODO_API_KEY = os.getenv("DODO_API_KEY", "test_mode_key")
client = DodoPayments(bearer_token=DODO_API_KEY, environment="test_mode")

@router.post("/checkout")
async def create_checkout(
    product_id: str,
    user: User = Depends(current_active_user)
):
    try:
        # Create a checkout session using Dodo Payments SDK
        session = client.checkout_sessions.create(
            product_cart=[{"product_id": product_id, "quantity": 1}],
            customer={
                "email": user.email,
                "name": user.email.split("@")[0] # Simple name fallback
            },
            # Metatdata to link the payment back to our user
            metadata={"user_id": str(user.id)},
            return_url="http://localhost:3000/dashboard?upgrade=success"
        )
        return {"checkout_url": session.checkout_url}
    except Exception as e:
        logger.error(f"Dodo Checkout Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.post("/webhook")
async def dodo_webhook(
    request: Request,
    x_dodo_signature: str = Header(None)
):
    # In a real app, verify the signature using os.getenv("DODO_WEBHOOK_SECRET")
    payload = await request.json()
    event_type = payload.get("type")
    
    logger.info(f"Received Dodo Webhook: {event_type}")
    
    if event_type == "subscription.created" or event_type == "payment.succeeded":
        metadata = payload.get("data", {}).get("metadata", {})
        user_id = metadata.get("user_id")
        
        if user_id:
            # TODO: Update user's subscription status in the database
            logger.info(f"Successfully upgraded user {user_id}")
            
    return {"status": "success"}
