from fastapi import APIRouter, HTTPException
from database import supabase
from models.session import SessionCreate

router = APIRouter()

@router.get("/")
def get_sessions():
    result = supabase.table("sessions").select(
        "*, locations(name, address)"
    ).execute()
    
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
def create_session(session: SessionCreate):
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
def delete_session(session_id: str):
    result = supabase.table("sessions").delete().eq("id", session_id).execute()
    return {"message": "Session deleted"}