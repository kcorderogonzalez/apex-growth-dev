from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import distinct, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import hash_password
from app.db.database import get_db
from app.dependencies import get_current_user, require_admin, require_admin_or_rsm
from app.models.user import SdrRepAssignment, User, VALID_ROLES
from app.schemas.user import AssignmentCreate, AssignmentResponse, UserCreate, UserResponse, UserUpdate

router = APIRouter()


@router.get("/territories", response_model=list[str])
async def list_territories(
    current_user: dict = Depends(require_admin_or_rsm),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(distinct(User.territory))
        .where(User.territory.isnot(None))
        .order_by(User.territory)
    )
    return [row for (row,) in result.all()]


@router.get("", response_model=list[UserResponse])
async def list_users(
    current_user: dict = Depends(require_admin_or_rsm),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.full_name))
    return result.scalars().all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
        territory=body.territory,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] not in ("admin", "rsm") and str(user_id) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    body: UserUpdate,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        if body.role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = body.role
    if body.territory is not None:
        user.territory = body.territory
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.password is not None:
        user.password_hash = hash_password(body.password)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if str(user_id) == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()


# ─── SDR Assignments ──────────────────────────────────────────────────────────

@router.get("/{sdr_id}/assignments", response_model=list[AssignmentResponse])
async def list_assignments(
    sdr_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user["role"] not in ("admin", "rsm") and str(sdr_id) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(SdrRepAssignment)
        .where(SdrRepAssignment.sdr_id == sdr_id)
        .options(selectinload(SdrRepAssignment.rep))
    )
    assignments = result.scalars().all()
    return [
        AssignmentResponse(
            id=a.id,
            sdr_id=a.sdr_id,
            rep_id=a.rep_id,
            rep_name=a.rep.full_name,
            rep_email=a.rep.email,
            created_at=a.created_at,
        )
        for a in assignments
    ]


@router.post("/{sdr_id}/assignments", response_model=AssignmentResponse, status_code=201)
async def add_assignment(
    sdr_id: UUID,
    body: AssignmentCreate,
    current_user: dict = Depends(require_admin_or_rsm),
    db: AsyncSession = Depends(get_db),
):
    sdr_result = await db.execute(select(User).where(User.id == sdr_id, User.role == "sdr"))
    if not sdr_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="SDR not found")

    rep_result = await db.execute(select(User).where(User.id == body.rep_id))
    rep = rep_result.scalar_one_or_none()
    if not rep:
        raise HTTPException(status_code=404, detail="Rep not found")

    existing = await db.execute(
        select(SdrRepAssignment).where(
            SdrRepAssignment.sdr_id == sdr_id,
            SdrRepAssignment.rep_id == body.rep_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Assignment already exists")

    assignment = SdrRepAssignment(sdr_id=sdr_id, rep_id=body.rep_id)
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    return AssignmentResponse(
        id=assignment.id,
        sdr_id=assignment.sdr_id,
        rep_id=assignment.rep_id,
        rep_name=rep.full_name,
        rep_email=rep.email,
        created_at=assignment.created_at,
    )


@router.delete("/{sdr_id}/assignments/{rep_id}", status_code=204)
async def remove_assignment(
    sdr_id: UUID,
    rep_id: UUID,
    current_user: dict = Depends(require_admin_or_rsm),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SdrRepAssignment).where(
            SdrRepAssignment.sdr_id == sdr_id,
            SdrRepAssignment.rep_id == rep_id,
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.delete(assignment)
    await db.commit()
