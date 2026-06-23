import json
import logging
from collections.abc import AsyncGenerator
from datetime import date

from google import genai
from google.genai import types as genai_types

from app.agents.hooks import log_completion, log_error, log_request
from app.agents.subagents import get_system_prompt
from app.config import settings

logger = logging.getLogger(__name__)

MODEL = "models/gemini-2.5-flash"

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set — add it to your .env file.")
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def fetch_active_memories(session, intent: str) -> list[dict]:
    from sqlalchemy import select
    from app.models.memory_library import Memory, MemoryVersion

    result = await session.execute(
        select(Memory, MemoryVersion)
        .join(MemoryVersion, Memory.current_version_id == MemoryVersion.id)
        .where(Memory.status == "Published")
        .where(Memory.target_agents.contains([intent]))
        .order_by(MemoryVersion.authored_at.desc())
    )
    rows = result.all()
    memories = []
    for memory, version in rows:
        memories.append({
            "name": memory.name,
            "department": memory.department,
            "authored_at": version.authored_at.strftime("%b %d %Y"),
            "content": version.content,
        })
    return memories


def _format_memory_block(memories: list[dict]) -> str:
    lines = [
        "## Operational Memory",
        "",
        "The following context was provided by your organization's Operations team. Treat it as authoritative org-level guidance.",
        "",
    ]
    for m in memories:
        lines.append("---")
        lines.append("")
        lines.append(f"### {m['name']} ({m['department']} — {m['authored_at']})")
        lines.append(m["content"])
        lines.append("")
    return "\n".join(lines)


def _build_system(raw_system: str, context: dict | None, intent: str | None) -> str:
    today = date.today().strftime("%B %d, %Y")
    system = f"Today's date is {today}.\n\n{raw_system}"

    if context and context.get("_operationalMemories"):
        system = system + "\n\n" + _format_memory_block(context["_operationalMemories"])

    if context and context.get("userTerritory"):
        role_label = context.get("userRole", "rep").upper()
        name_label = context.get("userName", "")
        territory_label = context["userTerritory"]
        account_list = context.get("territoryAccounts", [])
        accounts_str = ", ".join(account_list[:30]) if account_list else "not specified"
        system += (
            f"\n\nCURRENT USER CONTEXT:\n"
            f"- Name: {name_label} | Role: {role_label} | Territory: {territory_label}\n"
            f"- Assigned accounts (territory): {accounts_str}\n"
            f"When the user asks about 'my accounts', 'my territory', or 'my pipeline', "
            f"scope your answer to the {territory_label} territory and its assigned accounts above."
        )

    return system


def _build_prompt(prompt: str, context: dict | None, history: list[dict] | None) -> tuple[str, list[dict]]:
    """Returns (user_text, history_turns) for Gemini contents format."""
    contents: list[dict] = []

    if history:
        for msg in history:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    user_text = prompt
    if context:
        clean_ctx = {k: v for k, v in context.items() if not k.startswith("_")}
        if clean_ctx:
            context_block = json.dumps(clean_ctx, indent=2)
            user_text = f"<account_context>\n{context_block}\n</account_context>\n\n{prompt}"

    contents.append({"role": "user", "parts": [{"text": user_text}]})
    return user_text, contents


async def run_agent(
    prompt: str,
    user_id: str,
    intent: str | None = None,
    context: dict | None = None,
    history: list[dict] | None = None,
) -> AsyncGenerator[dict, None]:
    """
    Stream agent events. Yields dicts with type: delta | result | error.
    """
    raw_system = get_system_prompt(intent)

    if context and intent == "memory_agent":
        memory_summary = context.get("memorySummary", "No preferences configured yet.")
        admin_locks_list = context.get("adminLocks", [])
        admin_locks_str = ", ".join(admin_locks_list) if admin_locks_list else "None"
        raw_system = raw_system.replace("{memory_summary}", memory_summary).replace("{admin_locks}", admin_locks_str)

    if intent == "memory_draft_assistant":
        desc_map: dict = (context or {}).get("_resolvedAgentDescriptions", {})
        prompt_map: dict = (context or {}).get("_resolvedAgentSystemPrompts", {})
        desc_lines = [f"- {k}: {v}" for k, v in desc_map.items()]
        prompt_blocks = [f"### {k}\n{v}" for k, v in prompt_map.items()]
        raw_system = raw_system.replace(
            "{target_agent_descriptions}",
            "\n".join(desc_lines) or "No agents selected yet.",
        ).replace(
            "{target_agent_system_prompts}",
            "\n\n".join(prompt_blocks) or "No agents selected.",
        )

    system = _build_system(raw_system, context, intent)
    _user_text, contents = _build_prompt(prompt, context, history)

    log_request(user_id, intent, prompt)

    try:
        client = get_client()
        full_text = ""

        config = genai_types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=8096,
            temperature=0.7,
        )

        async for chunk in await client.aio.models.generate_content_stream(
            model=MODEL,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                full_text += chunk.text
                yield {"type": "delta", "content": chunk.text}

        log_completion(user_id, intent, None)
        yield {"type": "result", "content": full_text}

    except Exception as exc:
        msg = str(exc)
        if "api_key" in msg.lower() or "authentication" in msg.lower() or "GEMINI_API_KEY" in msg:
            msg = "GEMINI_API_KEY is not set or invalid — check your .env file."
        log_error(user_id, intent, msg)
        yield {"type": "error", "content": msg}
