from fastapi import APIRouter, HTTPException

from app import openclaw_bridge as oc
from app.models import (
    SystemOverview, GatewayStatus, OpenClawAgent, SessionInfo,
    ChannelHealth, MemoryStatus, SecurityFinding,
)
from app.routes.channels import _parse_channels
from app.routes.agents import _enrich_agent

router = APIRouter(tags=["overview"])


@router.get("/overview", response_model=SystemOverview)
async def get_overview():
    """Single endpoint that returns the full system state for the dashboard."""
    try:
        status = await oc.get_status()
        health = await oc.get_health()
        agents_raw = await oc.get_agents()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    gw = status.get("gateway", {})
    gw_self = gw.get("self", {})
    gw_service = status.get("gatewayService", {})

    gateway = GatewayStatus(
        mode=gw.get("mode", ""),
        url=gw.get("url", ""),
        reachable=gw.get("reachable", False),
        connectLatencyMs=gw.get("connectLatencyMs"),
        host=gw_self.get("host", ""),
        ip=gw_self.get("ip", ""),
        version=gw_self.get("version", ""),
        platform=gw_self.get("platform", ""),
        serviceInstalled=gw_service.get("installed", False),
        serviceRunning=gw_service.get("runtimeShort", ""),
    )

    agents = [
        OpenClawAgent(**_enrich_agent(a, status))
        for a in agents_raw
    ]

    sessions_raw = status.get("sessions", {}).get("recent", [])
    sessions = [SessionInfo(**s) for s in sessions_raw]

    channels = [ChannelHealth(**c) for c in _parse_channels(health)]

    mem = status.get("memory", {})
    memory = MemoryStatus(
        agentId=mem.get("agentId", ""),
        backend=mem.get("backend", ""),
        files=mem.get("files", 0),
        chunks=mem.get("chunks", 0),
        dirty=mem.get("dirty", False),
        vectorAvailable=mem.get("vector", {}).get("available", False),
        ftsAvailable=mem.get("fts", {}).get("available", False),
    )

    security_findings = status.get("securityAudit", {}).get("findings", [])
    security = [SecurityFinding(**f) for f in security_findings]

    return SystemOverview(
        gateway=gateway,
        agents=agents,
        sessions=sessions,
        channels=channels,
        memory=memory,
        security=security,
        os=status.get("os", {}),
        update=status.get("update", {}),
        totalSessions=status.get("agents", {}).get("totalSessions", 0),
        healthOk=health.get("ok", False),
    )
