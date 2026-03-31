import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def send_booking_confirmation(member_name: str, member_email: str, session_date: str, session_location: str, status: str):
    
    if status == "tbc":
        subject = "You've signed up for badminton — awaiting confirmation"
        status_message = "Your spot is currently <strong>TBC</strong>. Please confirm or remove your signup so others can plan."
    elif status == "confirmed":
        subject = "Your badminton spot is confirmed!"
        status_message = "Great news — your spot is <strong>confirmed</strong>. See you on the court!"
    elif status == "waitlisted":
        subject = "You're on the waitlist for badminton"
        status_message = """You're on the <strong>waitlist</strong> for this session — it's currently full. 
        We'll automatically confirm your spot and notify you if someone cancels. 
        No action needed from you."""
    elif status == "cancelled":
        subject = "Your badminton booking has been cancelled"
        status_message = "Your booking has been <strong>cancelled</strong>. Sign up for another session anytime."
    else:
        return

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">Badminton Club</h2>
        <p>Hi {member_name},</p>
        <p>{status_message}</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Date:</strong> {session_date}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> {session_location}</p>
        </div>
        <p style="color: #666; font-size: 13px;">Reply to this email if you have any questions.</p>
    </div>
    """

    resend.Emails.send({
        "from": "Badminton Club <onboarding@resend.dev>",
        "to": member_email,
        "subject": subject,
        "html": html_body
    })