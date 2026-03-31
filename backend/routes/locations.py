from fastapi import APIRouter, HTTPException, Security
from database import supabase
from auth import get_current_admin
from pydantic import BaseModel

router = APIRouter()

class LocationCreate(BaseModel):
    name: str
    address: str = None
    max_courts: int = 1

@router.get("/")
def get_locations():
    result = supabase.table("locations").select("*").execute()
    return result.data

@router.post("/")
def create_location(
    location: LocationCreate,
    current_admin=Security(get_current_admin)
):
    result = supabase.table("locations").insert(
        location.model_dump()
    ).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create location")
    return result.data[0]