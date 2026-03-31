from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase

router = APIRouter()

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(request: SignUpRequest):
    auth_response = supabase.auth.sign_up({
        "email": request.email,
        "password": request.password
    })
    
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed")
    
    auth_id = auth_response.user.id

    member_result = supabase.table("members").insert({
        "name": request.name,
        "email": request.email,
        "phone": request.phone,
        "auth_id": auth_id
    }).execute()

    if not member_result.data:
        raise HTTPException(status_code=400, detail="Could not create member profile")

    return {
        "message": "Account created successfully. Please check your email to confirm your account.",
        "member": member_result.data[0]
    }

@router.post("/login")
def login(request: LoginRequest):
    auth_response = supabase.auth.sign_in_with_password({
        "email": request.email,
        "password": request.password
    })

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    auth_id = auth_response.user.id
    member_result = supabase.table("members").select("*").eq(
        "auth_id", auth_id
    ).execute()

    member_data = member_result.data[0] if member_result.data else {
        "id": auth_response.user.id,
        "email": auth_response.user.email
    }

    return {
        "access_token": auth_response.session.access_token,
        "token_type": "bearer",
        "member": member_data
    }

@router.post("/logout")
def logout():
    supabase.auth.sign_out()
    return {"message": "Logged out successfully"}