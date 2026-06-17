import logging
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import decode_token
from app.db.database import get_db

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)

_DEV_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "admin@netskope.com",
    "role": "admin",
    "full_name": "Dev Admin",
    "territory": None,
}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if settings.SKIP_AUTH:
        return _DEV_USER

    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise ValueError("not an access token")
        return {
            "id": payload["sub"],
            "email": payload["email"],
            "role": payload["role"],
            "territory": payload.get("territory"),
            "territory_id": payload.get("territory_id"),
        }
    except Exception as exc:
        logger.debug("Token decode failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return current_user


async def require_ops_or_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in ("admin", "ops"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ops or Admin required")
    return current_user


async def require_admin_or_rsm(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in ("admin", "rsm"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or RSM required")
    return current_user


async def get_visible_rep_ids(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[str]:
    """Return list of rep UUIDs this user is allowed to see data for."""
    from app.models.user import SdrRepAssignment

    role = current_user["role"]
    uid = current_user["id"]

    if role in ("admin", "rsm"):
        return []  # empty = no filter = see all

    if role == "sdr":
        result = await db.execute(
            select(SdrRepAssignment.rep_id).where(SdrRepAssignment.sdr_id == UUID(uid))
        )
        rep_ids = [str(r) for r in result.scalars().all()]
        return rep_ids if rep_ids else [uid]

    return [uid]
