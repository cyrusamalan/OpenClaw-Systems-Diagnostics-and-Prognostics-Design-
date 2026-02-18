from fastapi import APIRouter, HTTPException
from typing import Optional

from app import openclaw_bridge as oc
from app.models import SessionInfo

router = APIRouter(tags=["sessions"])


@router.get("/sessions", response_model=list[SessionInfo])
async def list_sessions(agent_id: Optional[str] = None):
    try:
        status = await oc.get_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    sessions_data = status.get("sessions", {})
    raw_sessions = sessions_data.get("recent", [])

    if agent_id:
        raw_sessions = [s for s in raw_sessions if s.get("agentId") == agent_id]

    return [SessionInfo(**s) for s in raw_sessions]


@router.get("/sessions/{session_id}", response_model=SessionInfo)
async def get_session(session_id: str):
    try:
        status = await oc.get_status()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    for s in status.get("sessions", {}).get("recent", []):
        if s.get("sessionId") == session_id:
            return SessionInfo(**s)

    raise HTTPException(status_code=404, detail="Session not found")
