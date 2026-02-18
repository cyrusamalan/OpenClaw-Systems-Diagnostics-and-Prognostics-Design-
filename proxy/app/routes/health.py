from fastapi import APIRouter

from app import openclaw_bridge as oc

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    try:
        health = await oc.get_health()
        return {
            "status": "ok",
            "service": "openclaw-proxy",
            "openclaw": {
                "ok": health.get("ok", False),
                "defaultAgentId": health.get("defaultAgentId"),
                "heartbeatSeconds": health.get("heartbeatSeconds"),
            },
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "openclaw-proxy",
            "openclaw": {"ok": False, "error": str(e)},
        }
