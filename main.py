from fastapi import FastAPI
from routes import sessions, bookings, auth

app = FastAPI(title="Badminton Club API")

app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def home():
    return {"message": "Badminton club API is running!"}