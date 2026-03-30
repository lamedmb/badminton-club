from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from uuid import UUID

class SessionCreate(BaseModel):
    location_id: UUID
    date: date
    start_time: time
    end_time: time
    courts_booked: int
    capacity_per_court: int = 4
    cost: float = 0
    notes: Optional[str] = None

class SessionResponse(SessionCreate):
    id: UUID
    max_capacity: int