import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import run_agent
from app.db.database import get_db
from app.dependencies import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    prompt: str
    intent: str | None = None
    context: dict | None = None
    history: list[dict] | None = None


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ctx = request.context or {}
    if user.get("territory"):
        ctx = {
            **ctx,
            "userTerritory": user["territory"],
            "userRole": user.get("role", ""),
            "userName": user.get("full_name", user.get("email", "")),
        }

    # Resolve DB-dependent data eagerly before the StreamingResponse is
    # returned — FastAPI tears down Depends(get_db) immediately after this
    # function returns, so the session is closed before the streaming body
    # is consumed. Any DB work must happen here, not inside the generator.
    if request.intent == "memory_draft_assistant":
        target_keys = ctx.get("targetAgentKeys") or []
        if target_keys:
            from sqlalchemy import select
            from app.models.memory_library import AgentRegistryEntry
            result = await db.execute(
                select(AgentRegistryEntry).where(
                    AgentRegistryEntry.intent_key.in_(target_keys)
                )
            )
            entries = result.scalars().all()
            ctx = {
                **ctx,
                "_resolvedAgentDescriptions": {e.intent_key: e.description for e in entries},
                "_resolvedAgentSystemPrompts": {e.intent_key: e.system_prompt for e in entries},
            }

    if request.intent not in ("memory_agent", "memory_parse", "memory_draft_assistant"):
        try:
            from app.agents.orchestrator import fetch_active_memories
            memories = await fetch_active_memories(db, request.intent or "")
            if memories:
                ctx = {**ctx, "_operationalMemories": memories}
        except Exception:
            pass

    async def event_generator():
        try:
            async for event in run_agent(
                prompt=request.prompt,
                user_id=user["id"],
                intent=request.intent,
                context=ctx,
                history=request.history,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'content': str(exc)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
