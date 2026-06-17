from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.db.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserTokenPayload,
)

router = APIRouter()


def _user_payload(user: User) -> UserTokenPayload:
    territory_name = user.territory_obj.name if user.territory_obj else user.territory
    return UserTokenPayload(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        territory=territory_name,
        territory_id=str(user.territory_id) if user.territory_id else None,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    await db.execute(
        update(User).where(User.id == user.id).values(last_login=datetime.now(timezone.utc))
    )
    await db.commit()

    territory_name = user.territory_obj.name if user.territory_obj else user.territory
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email, user.role, territory_name, str(user.territory_id) if user.territory_id else None),
        refresh_token=create_refresh_token(str(user.id)),
        user=_user_payload(user),
    )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("not a refresh token")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == payload["sub"], User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return AccessTokenResponse(
        access_token=create_access_token(str(user.id), user.email, user.role)
    )


@router.get("/me", response_model=UserTokenPayload)
async def me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from app.config import settings as cfg
    if cfg.SKIP_AUTH:
        return UserTokenPayload(
            id=current_user["id"],
            email=current_user.get("email", "admin@netskope.com"),
            full_name=current_user.get("full_name", "Dev Admin"),
            role=current_user.get("role", "admin"),
            territory=current_user.get("territory"),
        )
    result = await db.execute(select(User).where(User.id == current_user["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_payload(user)


@router.post("/impersonate/{user_id}", response_model=TokenResponse)
async def impersonate(
    user_id: str,
    _admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only: return tokens scoped to any user for 'Login As' support."""
    from uuid import UUID as _UUID
    result = await db.execute(select(User).where(User.id == _UUID(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    territory_name = user.territory_obj.name if user.territory_obj else user.territory
    return TokenResponse(
        access_token=create_access_token(str(user.id), user.email, user.role, territory_name, str(user.territory_id) if user.territory_id else None),
        refresh_token=create_refresh_token(str(user.id)),
        user=_user_payload(user),
    )


@router.post("/logout")
async def logout():
    # Access tokens are stateless; client discards them. Refresh tokens not stored server-side.
    return {"ok": True}
