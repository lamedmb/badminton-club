from fastapi import APIRouter, HTTPException, Security
from database import supabase
from auth import get_current_admin

router = APIRouter()

@router.get("/")
def get_all_members(current_admin=Security(get_current_admin)):
    result = supabase.table("members").select("*").order("created_at").execute()
    return result.data

@router.get("/{member_id}/bookings")
def get_member_bookings(
    member_id: str,
    current_admin=Security(get_current_admin)
):
    result = supabase.table("bookings").select(
        "*, sessions(date, start_time, end_time, locations(name))"
    ).eq("member_id", member_id).order("created_at", desc=True).execute()
    return result.data

@router.delete("/{member_id}")
def delete_member(
    member_id: str,
    current_admin=Security(get_current_admin)
):
    supabase.table("bookings").update({
        "status": "cancelled"
    }).eq("member_id", member_id).execute()

    result = supabase.table("members").delete().eq("id", member_id).execute()
    return {"message": "Member removed"}