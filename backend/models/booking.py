from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class BookingCreate(BaseModel):
    session_id: UUID

class BookingStatusUpdate(BaseModel):
    status: str

class BookingResponse(BaseModel):
    id: UUID
    session_id: UUID
    member_id: UUID
    status: str
    status_updated_at: datetime