import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def log_request(user_id: str, intent: str | None, prompt_preview: str) -> None:
    logger.info(json.dumps({
        "event": "agent_request",
        "user_id": user_id,
        "intent": intent,
        "prompt_preview": prompt_preview[:120],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }))


def log_completion(user_id: str, intent: str | None, token_count: int | None = None) -> None:
    logger.info(json.dumps({
        "event": "agent_completion",
        "user_id": user_id,
        "intent": intent,
        "tokens": token_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }))


def log_error(user_id: str, intent: str | None, error: str) -> None:
    logger.error(json.dumps({
        "event": "agent_error",
        "user_id": user_id,
        "intent": intent,
        "error": error,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }))
