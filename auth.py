from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv
from database import supabase
import urllib.request
import json
import os

load_dotenv()

security = HTTPBearer()
JWKS_URL = os.getenv("SUPABASE_JWKS_URL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

def get_jwks():
    with urllib.request.urlopen(JWKS_URL) as response:
        return json.loads(response.read())

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials

    try:
        import jwt as pyjwt
        from jwt import PyJWKClient

        jwks_client = PyJWKClient(JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False}
        )
        return payload

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

def get_current_member(credentials: HTTPAuthorizationCredentials = Security(security)):
    payload = verify_token(credentials)

    auth_id = payload.get("sub")
    if not auth_id:
        raise HTTPException(status_code=401, detail="Token missing user ID")

    result = supabase.table("members").select("*").eq("auth_id", auth_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Member profile not found. Please complete registration."
        )

    return result.data[0]

def get_current_admin(credentials: HTTPAuthorizationCredentials = Security(security)):
    payload = verify_token(credentials)

    email = payload.get("email")
    if email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")

    return payload