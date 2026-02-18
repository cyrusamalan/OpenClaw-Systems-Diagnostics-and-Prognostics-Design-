from fastapi import APIRouter, HTTPException

from app import openclaw_bridge as oc
from app.models import ChannelHealth

router = APIRouter(tags=["channels"])


def _parse_channels(health_data: dict) -> list[dict]:
    results = []
    channel_labels = health_data.get("channelLabels", {})
    channels = health_data.get("channels", {})

    for channel_id, channel_data in channels.items():
        label = channel_labels.get(channel_id, channel_id)

        accounts = channel_data.get("accounts", {})
        for account_id, account in accounts.items():
            probe = account.get("probe", {})
            bot = probe.get("bot", {})
            results.append({
                "name": label,
                "channelId": channel_id,
                "configured": account.get("configured", False),
                "running": account.get("running", False),
                "probeOk": probe.get("ok"),
                "probeElapsedMs": probe.get("elapsedMs"),
                "botUsername": bot.get("username"),
                "botId": bot.get("id"),
                "lastError": account.get("lastError"),
                "accountId": account_id,
            })

    return results


@router.get("/channels", response_model=list[ChannelHealth])
async def list_channels():
    try:
        health = await oc.get_health()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenClaw unreachable: {e}")

    return [ChannelHealth(**c) for c in _parse_channels(health)]
