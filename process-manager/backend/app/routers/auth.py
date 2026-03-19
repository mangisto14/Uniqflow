from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db=Depends(get_db)):
    try:
        res = db.auth.sign_up({"email": body.email, "password": body.password})
        if res.user is None:
            raise HTTPException(400, "Registration failed")
        # Store name in user metadata via admin API
        db.auth.admin.update_user_by_id(
            res.user.id, {"user_metadata": {"name": body.name}}
        )
        return TokenResponse(
            access_token=res.session.access_token if res.session else "",
            user={"id": res.user.id, "email": res.user.email, "name": body.name},
        )
    except Exception as e:
        raise HTTPException(400, str(e))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db=Depends(get_db)):
    try:
        res = db.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if not res.session:
            raise HTTPException(401, "Invalid credentials")
        user = res.user
        name = (user.user_metadata or {}).get("name", user.email)
        return TokenResponse(
            access_token=res.session.access_token,
            user={"id": user.id, "email": user.email, "name": name},
        )
    except Exception as e:
        raise HTTPException(401, str(e))


@router.post("/logout")
async def logout(db=Depends(get_db)):
    db.auth.sign_out()
    return {"message": "Logged out"}
