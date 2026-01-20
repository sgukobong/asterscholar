from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .auth import auth_backend, fastapi_users, current_active_user
from .db import User, create_db_and_tables
from .schemas import UserCreate, UserRead, UserUpdate

app = FastAPI(title="Asterscholar Auth Service")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

@app.on_event("startup")
async def on_startup():
    # Not for production, use migrations
    await create_db_and_tables()

@app.get("/me")
async def get_me(user: User = Depends(current_active_user)):
    return {"message": f"Hello {user.email}!"}
