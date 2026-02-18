from fastapi import APIRouter, HTTPException

from app import openclaw_bridge as oc
from app.models import OpenClawAgent, CreateAgentRequest

router = APIRouter(tags=["agents"])


def _enrich_agent(agent_raw: dict, status_data: dict | None) -> dict:
    """Merge agent list data with status enrichment."""
    enriched = {**agent_raw}
    if status_data:
        agents_status = status_data.get("agents", {}).get("agents", [])
        for sa in agents_status:
            if sa.get("id") == agent_raw.get("id"):
                enriched["sessionsCount"] = sa.get("sessionsCount", 0)
                enriched["lastActiveAgeMs"] = sa.get("lastActiveAgeMs")
                break

        health_data = status_data.get("heartbeat", {})
        for ha in health_data.get("agents", []):
            if ha.get("agentId") == agent_raw.get("id"):
                enriched["heartbeatEnabled"] = ha.get("enabled", False)
                enriched["heartbeatEvery"] = ha.get("every", "")
                break

    return enriched


@router.get("/agents", response_model=list[OpenClawAgent])
async def list_agents():
    try:
        agents_raw = await oc.get_agents()
        status_data = await oc.get_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    return [
        OpenClawAgent(**_enrich_agent(a, status_data))
        for a in agents_raw
    ]


@router.get("/agents/{agent_id}", response_model=OpenClawAgent)
async def get_agent(agent_id: str):
    try:
        agents_raw = await oc.get_agents()
        status_data = await oc.get_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    for a in agents_raw:
        if a.get("id") == agent_id:
            return OpenClawAgent(**_enrich_agent(a, status_data))

    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/agents")
async def create_agent(body: CreateAgentRequest):
    try:
        result = await oc.create_agent(
            name=body.name,
            workspace=body.workspace or None,
            model=body.model or None,
        )
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
