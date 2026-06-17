from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.dependencies import require_ops_or_admin
from app.models.memory_library import AgentRegistryEntry, Memory, MemoryVersion
from app.schemas.memory_library import (
    AgentRegistryEntryOut,
    MemoryCreate,
    MemoryOut,
    MemoryUpdate,
    MemoryVersionCreate,
    MemoryVersionOut,
)

router = APIRouter()
registry_router = APIRouter()


def _safe_user_id(user: dict) -> UUID | None:
    """Return the user UUID, or None if it looks like the SKIP_AUTH dev stub.
    The stub ID is all-zeros which has no row in the users table, so we pass
    None to avoid FK violations on nullable created_by / authored_by columns."""
    from app.config import settings
    if settings.SKIP_AUTH:
        return None
    raw = user.get("id", "")
    return UUID(raw) if raw else None


def _memory_q():
    """Select Memory with relationships needed for MemoryOut eagerly loaded.
    Does NOT load Memory.versions — use list_versions endpoint for full history."""
    return select(Memory).options(
        selectinload(Memory.creator),
        selectinload(Memory.current_version).selectinload(MemoryVersion.author),
    )


def _version_out(v: MemoryVersion) -> MemoryVersionOut:
    author_name = v.author.full_name if v.author else None
    return MemoryVersionOut(
        id=v.id,
        memory_id=v.memory_id,
        version_number=v.version_number,
        content=v.content,
        change_summary=v.change_summary,
        authored_by=v.authored_by,
        authored_at=v.authored_at,
        is_current=v.is_current,
        author_name=author_name,
    )


def _memory_out(m: Memory) -> MemoryOut:
    creator_name = m.creator.full_name if m.creator else None
    current_v = _version_out(m.current_version) if m.current_version else None
    return MemoryOut(
        id=m.id,
        name=m.name,
        description=m.description,
        department=m.department,
        target_agents=m.target_agents or [],
        status=m.status,
        current_version_id=m.current_version_id,
        created_by=m.created_by,
        created_at=m.created_at,
        updated_at=m.updated_at,
        current_version=current_v,
        creator_name=creator_name,
    )


@router.get("", response_model=list[MemoryOut])
async def list_memories(
    status: str | None = None,
    department: str | None = None,
    target_agent: str | None = None,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    q = _memory_q()
    if status:
        q = q.where(Memory.status == status)
    if department:
        q = q.where(Memory.department == department)
    if target_agent:
        q = q.where(Memory.target_agents.contains([target_agent]))
    q = q.order_by(Memory.updated_at.desc())
    result = await db.execute(q)
    memories = result.scalars().all()
    return [_memory_out(m) for m in memories]


@router.post("", response_model=MemoryOut, status_code=status.HTTP_201_CREATED)
async def create_memory(
    body: MemoryCreate,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    user_id = _safe_user_id(user)
    memory = Memory(
        name=body.name,
        description=body.description,
        department=body.department,
        target_agents=body.target_agents,
        status=body.status,
        created_by=user_id,
    )
    db.add(memory)
    await db.flush()

    version = MemoryVersion(
        memory_id=memory.id,
        version_number=1,
        content=body.content,
        change_summary=body.change_summary,
        authored_by=user_id,
        is_current=True,
    )
    db.add(version)
    await db.flush()

    memory.current_version_id = version.id
    await db.commit()
    result = await db.execute(_memory_q().where(Memory.id == memory.id))
    return _memory_out(result.scalar_one())


@router.get("/{memory_id}", response_model=MemoryOut)
async def get_memory(
    memory_id: UUID,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_memory_q().where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    return _memory_out(memory)


@router.put("/{memory_id}", response_model=MemoryOut)
async def update_memory(
    memory_id: UUID,
    body: MemoryUpdate,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_memory_q().where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    if body.name is not None:
        memory.name = body.name
    if body.description is not None:
        memory.description = body.description
    if body.department is not None:
        memory.department = body.department
    if body.target_agents is not None:
        memory.target_agents = body.target_agents
    if body.status is not None:
        memory.status = body.status

    await db.commit()
    result = await db.execute(_memory_q().where(Memory.id == memory_id))
    return _memory_out(result.scalar_one())


@router.post("/{memory_id}/versions", response_model=MemoryVersionOut, status_code=status.HTTP_201_CREATED)
async def save_version(
    memory_id: UUID,
    body: MemoryVersionCreate,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    existing_result = await db.execute(select(MemoryVersion).where(MemoryVersion.memory_id == memory_id))
    existing_versions = existing_result.scalars().all()
    for v in existing_versions:
        v.is_current = False
    next_num = len(existing_versions) + 1

    user_id = _safe_user_id(user)
    version = MemoryVersion(
        memory_id=memory_id,
        version_number=next_num,
        content=body.content,
        change_summary=body.change_summary,
        authored_by=user_id,
        is_current=True,
    )
    db.add(version)
    await db.flush()

    memory.current_version_id = version.id
    if body.status:
        memory.status = body.status

    await db.commit()

    ver_result = await db.execute(
        select(MemoryVersion).options(selectinload(MemoryVersion.author)).where(MemoryVersion.id == version.id)
    )
    return _version_out(ver_result.scalar_one())


@router.put("/{memory_id}/promote/{version_id}", response_model=MemoryOut)
async def promote_version(
    memory_id: UUID,
    version_id: UUID,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    ver_result = await db.execute(
        select(MemoryVersion).where(MemoryVersion.id == version_id, MemoryVersion.memory_id == memory_id)
    )
    if not ver_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Version not found")

    existing = await db.execute(select(MemoryVersion).where(MemoryVersion.memory_id == memory_id))
    for v in existing.scalars().all():
        v.is_current = v.id == version_id

    memory.current_version_id = version_id
    await db.commit()
    result = await db.execute(_memory_q().where(Memory.id == memory_id))
    return _memory_out(result.scalar_one())


@router.put("/{memory_id}/archive", response_model=MemoryOut)
async def archive_memory(
    memory_id: UUID,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    memory = result.scalar_one_or_none()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    memory.status = "Archived"
    await db.commit()
    result = await db.execute(_memory_q().where(Memory.id == memory_id))
    return _memory_out(result.scalar_one())


@router.get("/{memory_id}/versions", response_model=list[MemoryVersionOut])
async def list_versions(
    memory_id: UUID,
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MemoryVersion)
        .options(selectinload(MemoryVersion.author))
        .where(MemoryVersion.memory_id == memory_id)
        .order_by(MemoryVersion.version_number.desc())
    )
    versions = result.scalars().all()
    return [_version_out(v) for v in versions]


@registry_router.get("", response_model=list[AgentRegistryEntryOut])
async def get_agent_registry(
    user: dict = Depends(require_ops_or_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AgentRegistryEntry).where(AgentRegistryEntry.is_active == True).order_by(AgentRegistryEntry.display_name)
    )
    return result.scalars().all()
