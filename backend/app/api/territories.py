from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.dependencies import get_current_user
from app.models.territory import Account, Territory
from app.schemas.territory import AccountResponse, TerritoryResponse

router = APIRouter()


@router.get("", response_model=list[TerritoryResponse])
async def list_territories(
    _: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Territory).order_by(Territory.name))
    return result.scalars().all()


@router.get("/{territory_id}", response_model=TerritoryResponse)
async def get_territory(
    territory_id: UUID,
    _: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Territory).where(Territory.id == territory_id))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="Territory not found")
    return t


@router.get("/{territory_id}/accounts", response_model=list[AccountResponse])
async def list_territory_accounts(
    territory_id: UUID,
    _: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Account)
        .where(Account.territory_id == territory_id)
        .options(selectinload(Account.territory_obj))
        .order_by(Account.name)
    )
    accounts = result.scalars().all()
    return [
        AccountResponse(
            id=a.id,
            name=a.name,
            type=a.type,
            industry=a.industry,
            tier=a.tier,
            arr=a.arr,
            health_score=a.health_score,
            hq_city=a.hq_city,
            hq_state=a.hq_state,
            territory_id=a.territory_id,
            territory_name=a.territory_obj.name if a.territory_obj else None,
        )
        for a in accounts
    ]


@router.get("/accounts/all", response_model=list[AccountResponse])
async def list_all_accounts(
    _: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Account).options(selectinload(Account.territory_obj)).order_by(Account.name)
    )
    accounts = result.scalars().all()
    return [
        AccountResponse(
            id=a.id,
            name=a.name,
            type=a.type,
            industry=a.industry,
            tier=a.tier,
            arr=a.arr,
            health_score=a.health_score,
            hq_city=a.hq_city,
            hq_state=a.hq_state,
            territory_id=a.territory_id,
            territory_name=a.territory_obj.name if a.territory_obj else None,
        )
        for a in accounts
    ]
