from fastapi import APIRouter, HTTPException

from app import openclaw_bridge as oc
from app.models import MetricsSummary

router = APIRouter(tags=["metrics"])


@router.get("/metrics", response_model=MetricsSummary)
async def get_metrics():
    try:
        status = await oc.get_status()
        health = await oc.get_health()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    agents_data = status.get("agents", {})
    gateway = status.get("gateway", {})
    memory = status.get("memory", {})
    security = status.get("securityAudit", {}).get("summary", {})
    channels = health.get("channels", {})

    channels_healthy = sum(
        1 for ch in channels.values()
        if ch.get("probe", {}).get("ok")
    )

    return MetricsSummary(
        totalAgents=len(agents_data.get("agents", [])),
        totalSessions=agents_data.get("totalSessions", 0),
        totalChannels=len(channels),
        channelsHealthy=channels_healthy,
        gatewayReachable=gateway.get("reachable", False),
        gatewayLatencyMs=gateway.get("connectLatencyMs", 0) or 0,
        securityCritical=security.get("critical", 0),
        securityWarnings=security.get("warn", 0),
        memoryChunks=memory.get("chunks", 0),
        memoryFiles=memory.get("files", 0),
    )
