from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sessions, bookings, auth, members, locations

app = FastAPI(title="Badminton Club API")

origins = [
    "http://localhost:3000",
    "https://gabminton.vercel.app/",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(members.router, prefix="/members", tags=["Members"])
app.include_router(locations.router, prefix="/locations", tags=["Locations"])

@app.get("/")
def home():
    return {"message": "Badminton club API is running!"}