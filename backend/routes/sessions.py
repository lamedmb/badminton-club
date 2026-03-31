from fastapi import APIRouter, HTTPException, Security
from database import supabase
from models.session import SessionCreate
from auth import get_current_admin
from datetime import date 

router = APIRouter()


@router.get("/")
def get_sessions():
    today = date.today().isoformat()
    
    result = supabase.table("sessions").select(
        "*, locations(name, address)"
    ).gte("date", today).order("date").execute()

    sessions = []
    for s in result.data:
        s["max_capacity"] = s["courts_booked"] * s["capacity_per_court"]
        sessions.append(s)

    return sessions


@router.get("/{session_id}")
def get_session(session_id: str):
    result = supabase.table("sessions").select(
        "*, locations(name, address)"
    ).eq("id", session_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    session = result.data[0]
    session["max_capacity"] = session["courts_booked"] * session["capacity_per_court"]
    return session


@router.post("/")
def create_session(
    session: SessionCreate,
    current_admin=Security(get_current_admin)
):
    data = session.model_dump()
    data["location_id"] = str(data["location_id"])
    data["start_time"] = str(data["start_time"])
    data["end_time"] = str(data["end_time"])
    data["date"] = str(data["date"])

    result = supabase.table("sessions").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create session")

    created = result.data[0]
    created["max_capacity"] = created["courts_booked"] * created["capacity_per_court"]
    return created


@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    current_admin=Security(get_current_admin)
):
    bookings = supabase.table("bookings").select("id").eq(
        "session_id", session_id
    ).neq("status", "cancelled").execute()

    if bookings.data:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete session with {len(bookings.data)} active booking(s). Cancel all bookings first."
        )

    result = supabase.table("sessions").delete().eq("id", session_id).execute()
    return {"message": "Session deleted successfully"}


@router.patch("/{session_id}")
def update_session(
    session_id: str,
    session: SessionCreate,
    current_admin=Security(get_current_admin)
):
    data = session.model_dump()
    data["location_id"] = str(data["location_id"])
    data["start_time"] = str(data["start_time"])
    data["end_time"] = str(data["end_time"])
    data["date"] = str(data["date"])

    result = supabase.table("sessions").update(data).eq("id", session_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    updated = result.data[0]
    updated["max_capacity"] = updated["courts_booked"] * updated["capacity_per_court"]
    return updated