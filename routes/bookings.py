from fastapi import APIRouter, HTTPException, Security
from database import supabase
from models.booking import BookingCreate, BookingStatusUpdate
from email_service import send_booking_confirmation
from auth import get_current_member, get_current_admin

router = APIRouter()


def get_session_capacity(session_id: str):
    result = supabase.table("sessions").select(
        "courts_booked, capacity_per_court"
    ).eq("id", session_id).execute()

    if not result.data:
        return None

    s = result.data[0]
    return s["courts_booked"] * s["capacity_per_court"]


def get_confirmed_count(session_id: str):
    result = supabase.table("bookings").select("id").eq(
        "session_id", session_id
    ).in_("status", ["confirmed", "tbc"]).execute()

    return len(result.data)


def get_session_and_member(session_id: str, member_id: str):
    session = supabase.table("sessions").select(
        "date, start_time, locations(name)"
    ).eq("id", session_id).execute()

    member = supabase.table("members").select(
        "name, email"
    ).eq("id", member_id).execute()

    return (
        session.data[0] if session.data else None,
        member.data[0] if member.data else None
    )


def promote_from_waitlist(session_id: str):
    max_capacity = get_session_capacity(session_id)
    current_count = get_confirmed_count(session_id)

    if current_count >= max_capacity:
        return

    next_in_line = supabase.table("bookings").select("id, member_id").eq(
        "session_id", session_id
    ).eq("status", "waitlisted").order("created_at").limit(1).execute()

    if not next_in_line.data:
        return

    promoted = next_in_line.data[0]

    supabase.table("bookings").update({
        "status": "tbc",
        "status_updated_at": "now()"
    }).eq("id", promoted["id"]).execute()

    session, member = get_session_and_member(session_id, promoted["member_id"])
    if session and member:
        try:
            send_booking_confirmation(
                member_name=member["name"],
                member_email=member["email"],
                session_date=str(session["date"]),
                session_location=session["locations"]["name"],
                status="tbc"
            )
        except Exception as e:
            print(f"Email failed (waitlist promotion): {e}")


@router.get("/session/{session_id}")
def get_session_bookings(
    session_id: str,
    current_admin=Security(get_current_admin)
):
    result = supabase.table("bookings").select(
        "*, members(name, email)"
    ).eq("session_id", session_id).execute()
    return result.data


@router.get("/my")
def get_my_bookings(current_member=Security(get_current_member)):
    result = supabase.table("bookings").select(
        "*, sessions(date, start_time, end_time, locations(name))"
    ).eq("member_id", current_member["id"]).execute()
    return result.data


@router.post("/")
def create_booking(
    booking: BookingCreate,
    current_member=Security(get_current_member)
):
    session_id = str(booking.session_id)
    member_id = current_member["id"]

    existing = supabase.table("bookings").select("id").eq(
        "session_id", session_id
    ).eq("member_id", member_id).neq("status", "cancelled").execute()

    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="You are already booked for this session"
        )

    max_capacity = get_session_capacity(session_id)
    if max_capacity is None:
        raise HTTPException(status_code=404, detail="Session not found")

    current_count = get_confirmed_count(session_id)
    status = "tbc" if current_count < max_capacity else "waitlisted"

    result = supabase.table("bookings").insert({
        "session_id": session_id,
        "member_id": member_id,
        "status": status
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Could not create booking")

    session, member = get_session_and_member(session_id, member_id)
    if session and member:
        try:
            send_booking_confirmation(
                member_name=member["name"],
                member_email=member["email"],
                session_date=str(session["date"]),
                session_location=session["locations"]["name"],
                status=status
            )
        except Exception as e:
            print(f"Email failed: {e}")

    return {
        "booking": result.data[0],
        "message": f"Booking created with status: {status}"
    }


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: str,
    update: BookingStatusUpdate,
    current_member=Security(get_current_member)
):
    valid_statuses = ["tbc", "confirmed", "waitlisted", "cancelled"]
    if update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of {valid_statuses}"
        )

    existing = supabase.table("bookings").select(
        "id, member_id, session_id"
    ).eq("id", booking_id).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking_owner = existing.data[0]["member_id"]
    if booking_owner != current_member["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own bookings"
        )

    result = supabase.table("bookings").update({
        "status": update.status,
        "status_updated_at": "now()"
    }).eq("id", booking_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = result.data[0]

    session, member = get_session_and_member(
        booking["session_id"], booking["member_id"]
    )
    if session and member:
        try:
            send_booking_confirmation(
                member_name=member["name"],
                member_email=member["email"],
                session_date=str(session["date"]),
                session_location=session["locations"]["name"],
                status=update.status
            )
        except Exception as e:
            print(f"Email failed: {e}")

    if update.status == "cancelled":
        promote_from_waitlist(booking["session_id"])

    return result.data[0]