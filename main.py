from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sessions, bookings, auth

app = FastAPI(title="Badminton Club API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def home():
    return {"message": "Badminton club API is running!"}
