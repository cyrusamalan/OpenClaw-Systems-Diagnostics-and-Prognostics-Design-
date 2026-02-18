import asyncio
import json

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app import openclaw_bridge as oc

router = APIRouter(tags=["logs"])


@router.get("/logs")
async def get_logs(limit: int = Query(100, ge=1, le=500)):
    try:
        raw = await oc.stream_logs(lines=limit)
    except Exception as e:
        return {"error": str(e), "entries": []}

    entries = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            entries.append({"raw": line})

    return entries


@router.get("/logs/stream")
async def stream_logs_sse():
    """SSE endpoint that tails `openclaw logs --follow --json`."""

    async def event_generator():
        cmd = oc.build_log_stream_cmd()
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            while True:
                line = await asyncio.wait_for(
                    proc.stdout.readline(), timeout=60
                )
                if not line:
                    break
                text = line.decode().strip()
                if text:
                    yield f"data: {text}\n\n"
        except asyncio.TimeoutError:
            yield "data: {\"keepalive\": true}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            proc.kill()
            await proc.wait()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
