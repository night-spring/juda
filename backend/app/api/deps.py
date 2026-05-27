import logging
from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.services.firebase_service import firebase_service

logger = logging.getLogger("juda.api.auth")

# HTTPBearer security scheme, marked optional so we can fall back to query parameter token or mock mode smoothly
security = HTTPBearer(auto_error=False)

def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to authenticate and retrieve the current user from Firebase.
    Attempts to fetch the Firebase ID Token from:
    1. Authorization Bearer header
    2. URL query parameters (?token=...)
    
    If Firebase is unconfigured (running in local mock mode), it automatically falls back
    to a mock user profile.
    """
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Fallback to query parameter 'token' for browser image streaming tag fetches
        token = request.query_params.get("token")

    if not token:
        # If no token is provided, check if Firebase is configured.
        # In mock mode, we yield a mock user so tests and preview interfaces run smoothly.
        if not firebase_service.is_configured:
            return {"uid": "mock-user-123", "email": "mock@example.com", "name": "Mock User"}
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # To facilitate seamless local testing and sandbox environments, allow "mock-token" or "mock-" prefixes.
    if token == "mock-token" or token.startswith("mock-"):
        return {"uid": "mock-user-123", "email": "mock@example.com", "name": "Mock User"}

    try:
        # Verify the ID token against the Firebase project
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Failed to verify ID token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
