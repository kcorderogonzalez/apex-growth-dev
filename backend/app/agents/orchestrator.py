import json
import logging
from collections.abc import AsyncGenerator
from datetime import date

from google import genai
from google.genai import types
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.hooks import log_completion, log_error, log_request
from app.agents.subagents import get_system_prompt
from app.config import settings

logger = logging.getLogger(__name__)

MODEL = "gemini-2.5-flash"

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def fetch_active_memories(session: AsyncSession, intent: str) -> list[dict]:
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


async def run_agent(
    prompt: str,
    user_id: str,
    intent: str | None = None,
    context: dict | None = None,
    history: list[dict] | None = None,
) -> AsyncGenerator[dict, None]:
    """
    Stream agent events. Yields dicts with type: delta | result | error.

    NOTE: Gemini is the current provider. To swap to Anthropic:
      1. Replace this file with the Anthropic SDK version
      2. Change GEMINI_API_KEY to ANTHROPIC_API_KEY in .env
      Everything else stays the same.
    """
    raw_system = get_system_prompt(intent)
    # Substitute memory placeholders for memory_agent intent
    if context and intent == "memory_agent":
        memory_summary = context.get("memorySummary", "No preferences configured yet.")
        admin_locks_list = context.get("adminLocks", [])
        admin_locks_str = ", ".join(admin_locks_list) if admin_locks_list else "None"
        raw_system = raw_system.replace("{memory_summary}", memory_summary).replace("{admin_locks}", admin_locks_str)

    # Substitute target agent context for memory_draft_assistant.
    # Data is pre-resolved in chat.py before the StreamingResponse is returned
    # (DB session is closed by the time the generator body executes).
    if intent == "memory_draft_assistant":
        desc_map: dict = (context or {}).get("_resolvedAgentDescriptions", {})
        prompt_map: dict = (context or {}).get("_resolvedAgentSystemPrompts", {})
        desc_lines = [f"- {k}: {v}" for k, v in desc_map.items()]
        prompt_blocks = [f"### {k}\n{v}" for k, v in prompt_map.items()]
        raw_system = raw_system.replace(
            "{target_agent_descriptions}", "\n".join(desc_lines) or "No agents selected yet — select target agents in the editor to tailor drafts."
        ).replace(
            "{target_agent_system_prompts}", "\n\n".join(prompt_blocks) or "No agents selected."
        )

    # Anchor the model to the current date — without this, "recent" means
    # its training cutoff and it will report stale company facts.
    today = date.today().strftime("%B %d, %Y")
    system = f"Today's date is {today}.\n\n{raw_system}"

    # Inject Published Operational Memories pre-fetched by chat.py
    if context and context.get("_operationalMemories"):
        system = system + "\n\n" + _format_memory_block(context["_operationalMemories"])

    # Inject territory identity so Hunter knows whose lens to apply
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

    log_request(user_id, intent, prompt)

    # Build contents list from history + current prompt
    contents: list[types.ContentUnion] = []
    if history:
        for msg in history:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))
    user_text = prompt
    if context:
        context_block = json.dumps(context, indent=2)
        user_text = f"<account_context>\n{context_block}\n</account_context>\n\n{prompt}"
    contents.append(types.Content(role="user", parts=[types.Part(text=user_text)]))

    # Hunter research card: two-step pipeline. Gemini cannot combine search
    # grounding with enforced JSON mode, so a single grounded call returns
    # JSON only by luck. Step 1 researches with live Google Search (free
    # text); step 2 formats the notes into JSON with response_mime_type
    # enforcement and no tools — guaranteed parseable.
    if intent == "hunter":
        try:
            client = get_client()

            research_system = system + (
                "\n\nFOR THIS STEP ONLY: do NOT output JSON. Use Google Search and the "
                "provided account_context to produce comprehensive research notes covering "
                "all 12 items. For each item, state the facts found, their source, their "
                "as-of date, and whether the item should be available=true or false."
            )
            research = await client.aio.models.generate_content(
                model=MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=research_system,
                    max_output_tokens=32768,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                ),
            )
            notes = research.text or ""
            if not notes.strip():
                yield {"type": "error", "content": "Hunter research step returned no data."}
                return

            format_contents = [types.Content(role="user", parts=[types.Part(text=(
                f"<research_notes>\n{notes}\n</research_notes>\n\n"
                "Convert these research notes into the 12-item Hunter JSON object exactly "
                "as specified in your instructions. Use only facts from the notes. "
                "Return ONLY the JSON object."
            ))])]

            full_text = ""
            async for chunk in await client.aio.models.generate_content_stream(
                model=MODEL,
                contents=format_contents,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    max_output_tokens=32768,
                    response_mime_type="application/json",
                ),
            ):
                text = getattr(chunk, 'text', None)
                if text:
                    full_text += text
                    yield {"type": "delta", "content": text}

            log_completion(user_id, intent, None)
            yield {"type": "result", "content": full_text}
        except Exception as exc:
            msg = str(exc)
            if "API_KEY" in msg or "authentication" in msg.lower() or "api key" in msg.lower():
                msg = "Invalid GEMINI_API_KEY — check your .env file."
            log_error(user_id, intent, msg)
            yield {"type": "error", "content": msg}
        return

    # Chat with Hunter keeps single-step search grounding (no JSON needed).
    tools = None
    if intent == "hunter_chat":
        tools = [types.Tool(google_search=types.GoogleSearch())]

    try:
        client = get_client()
        full_text = ""

        async for chunk in await client.aio.models.generate_content_stream(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system,
                # Gemini 2.5 thinking tokens count against this limit; with
                # search grounding the model reasons heavily, so leave ample
                # headroom or the JSON gets truncated mid-string.
                max_output_tokens=32768,
                tools=tools,
            ),
        ):
            text = getattr(chunk, 'text', None)
            if text:
                full_text += text
                yield {"type": "delta", "content": text}

        log_completion(user_id, intent, None)
        yield {"type": "result", "content": full_text}

    except Exception as exc:
        msg = str(exc)
        if "API_KEY" in msg or "authentication" in msg.lower() or "api key" in msg.lower():
            msg = "Invalid GEMINI_API_KEY — check your .env file."
        log_error(user_id, intent, msg)
        yield {"type": "error", "content": msg}
