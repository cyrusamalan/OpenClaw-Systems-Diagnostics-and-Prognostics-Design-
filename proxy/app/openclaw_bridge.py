"""Bridge to the real OpenClaw Gateway via its CLI.

Detects whether we're running on Windows (calls through WSL) or
Linux/WSL (calls the entry point directly). All commands use --json
for machine-readable output.

Results are cached with a short TTL to avoid hammering the CLI on
every poll cycle.
"""

import asyncio
import json
import os
import platform
import time
from typing import Any

IS_WINDOWS = platform.system() == "Windows"

OPENCLAW_CMD = os.getenv("OPENCLAW_CMD", "openclaw")
OPENCLAW_TOKEN = os.getenv("OPENCLAW_TOKEN", "")

_cache: dict[str, tuple[float, Any]] = {}
DEFAULT_TTL = 3.0


def _build_cmd(args: list[str]) -> list[str]:
    token_flag = f" --token {OPENCLAW_TOKEN}" if OPENCLAW_TOKEN else ""
    oc_args = " ".join(args) + " --json" + token_flag
    if IS_WINDOWS:
        return ["wsl", "--", "bash", "-lc", f"{OPENCLAW_CMD} {oc_args}"]
    else:
        parts = [OPENCLAW_CMD] + args + ["--json"]
        if OPENCLAW_TOKEN:
            parts += ["--token", OPENCLAW_TOKEN]
        return parts


async def _run(args: list[str], ttl: float = DEFAULT_TTL) -> Any:
    cache_key = " ".join(args)
    now = time.monotonic()
    if cache_key in _cache:
        cached_at, cached_val = _cache[cache_key]
        if now - cached_at < ttl:
            return cached_val

    cmd = _build_cmd(args)
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=20)

    raw = stdout.decode().strip()
    if not raw:
        err = stderr.decode().strip() if stderr else "empty output"
        raise RuntimeError(f"openclaw {' '.join(args)}: {err}")

    data = json.loads(raw)
    _cache[cache_key] = (now, data)
    return data


async def get_status() -> dict:
    return await _run(["status"])


async def get_health() -> dict:
    return await _run(["health"])


async def get_agents() -> list[dict]:
    return await _run(["agents", "list"])


async def get_sessions() -> dict:
    return await _run(["sessions"])


async def get_models_list() -> list[dict]:
    return await _run(["models", "list"])


async def get_models_status() -> dict:
    return await _run(["models", "status"])


async def get_skills() -> list[dict]:
    try:
        return await _run(["skills", "list"])
    except Exception:
        return []


async def get_channels() -> list[dict]:
    try:
        return await _run(["channels", "list"])
    except Exception:
        return []


async def get_gateway_health() -> dict:
    return await _run(["gateway", "health"], ttl=5.0)


async def stream_logs(lines: int = 200) -> str:
    """Get recent logs (non-streaming)."""
    cmd = _build_cmd(["logs", "--limit", str(lines)])
    # Remove the --json we already added via _build_cmd; logs are already json
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=15)
    return stdout.decode().strip()


def build_log_stream_cmd() -> list[str]:
    """Return the command list for tailing logs with --follow."""
    token_flag = f" --token {OPENCLAW_TOKEN}" if OPENCLAW_TOKEN else ""
    oc_args = "logs --follow --json" + token_flag
    if IS_WINDOWS:
        return ["wsl", "--", "bash", "-lc", f"{OPENCLAW_CMD} {oc_args}"]
    else:
        parts = [OPENCLAW_CMD, "logs", "--follow", "--json"]
        if OPENCLAW_TOKEN:
            parts += ["--token", OPENCLAW_TOKEN]
        return parts


def clear_cache():
    _cache.clear()
