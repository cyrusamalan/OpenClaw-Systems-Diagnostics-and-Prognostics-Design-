from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class OpenClawAgent(BaseModel):
    id: str
    identityName: str = ""
    identityEmoji: str = ""
    workspace: str = ""
    agentDir: str = ""
    model: str = ""
    bindings: int = 0
    isDefault: bool = False
    routes: list[str] = []
    # Enriched from status
    sessionsCount: int = 0
    lastActiveAgeMs: Optional[int] = None
    heartbeatEnabled: bool = False
    heartbeatEvery: str = ""


class SessionInfo(BaseModel):
    agentId: str
    key: str
    kind: str = ""
    sessionId: str
    updatedAt: Optional[int] = None
    age: Optional[int] = None
    inputTokens: Optional[int] = None
    outputTokens: Optional[int] = None
    totalTokens: Optional[int] = None
    remainingTokens: Optional[int] = None
    percentUsed: Optional[int] = None
    model: str = ""
    contextTokens: Optional[int] = None
    flags: list[str] = []
    systemSent: Optional[bool] = None


class ChannelHealth(BaseModel):
    name: str
    channelId: str
    configured: bool = False
    running: bool = False
    probeOk: Optional[bool] = None
    probeElapsedMs: Optional[int] = None
    botUsername: Optional[str] = None
    botId: Optional[str] = None
    lastError: Optional[str] = None
    accountId: str = "default"


class GatewayStatus(BaseModel):
    mode: str = "local"
    url: str = ""
    reachable: bool = False
    connectLatencyMs: Optional[int] = None
    host: str = ""
    ip: str = ""
    version: str = ""
    platform: str = ""
    serviceInstalled: bool = False
    serviceRunning: str = ""


class MemoryStatus(BaseModel):
    agentId: str = ""
    backend: str = ""
    files: int = 0
    chunks: int = 0
    dirty: bool = False
    vectorAvailable: bool = False
    ftsAvailable: bool = False


class SecurityFinding(BaseModel):
    checkId: str
    severity: str
    title: str
    detail: str = ""
    remediation: str = ""


class SystemOverview(BaseModel):
    gateway: GatewayStatus
    agents: list[OpenClawAgent]
    sessions: list[SessionInfo]
    channels: list[ChannelHealth]
    memory: MemoryStatus
    security: list[SecurityFinding]
    os: dict = {}
    update: dict = {}
    totalSessions: int = 0
    healthOk: bool = False


class MetricsSummary(BaseModel):
    totalAgents: int = 0
    totalSessions: int = 0
    totalChannels: int = 0
    channelsHealthy: int = 0
    gatewayReachable: bool = False
    gatewayLatencyMs: int = 0
    securityCritical: int = 0
    securityWarnings: int = 0
    memoryChunks: int = 0
    memoryFiles: int = 0


class LogEntry(BaseModel):
    raw: str = ""
    data: Optional[dict] = None
