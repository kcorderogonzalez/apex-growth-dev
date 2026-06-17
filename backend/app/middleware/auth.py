import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def verify_firebase_token(token: str) -> dict | None:
    if settings.SKIP_AUTH:
        return {"uid": "dev-user", "email": "dev@netskope.com"}

    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth

        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        decoded = firebase_auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email", "")}
    except Exception as exc:
        logger.warning("Token verification failed: %s", exc)
        return None
