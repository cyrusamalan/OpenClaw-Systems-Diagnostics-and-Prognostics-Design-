export interface OpenClawAgent {
  id: string;
  identityName: string;
  identityEmoji: string;
  workspace: string;
  agentDir: string;
  model: string;
  bindings: number;
  isDefault: boolean;
  routes: string[];
  sessionsCount: number;
  lastActiveAgeMs: number | null;
  heartbeatEnabled: boolean;
  heartbeatEvery: string;
}

export interface SessionInfo {
  agentId: string;
  key: string;
  kind: string;
  sessionId: string;
  updatedAt: number | null;
  age: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  remainingTokens: number | null;
  percentUsed: number | null;
  model: string;
  contextTokens: number | null;
  flags: string[];
  systemSent?: boolean;
}

export interface ChannelHealth {
  name: string;
  channelId: string;
  configured: boolean;
  running: boolean;
  probeOk: boolean | null;
  probeElapsedMs: number | null;
  botUsername: string | null;
  botId: string | null;
  lastError: string | null;
  accountId: string;
}

export interface GatewayStatus {
  mode: string;
  url: string;
  reachable: boolean;
  connectLatencyMs: number | null;
  host: string;
  ip: string;
  version: string;
  platform: string;
  serviceInstalled: boolean;
  serviceRunning: string;
}

export interface MemoryStatus {
  agentId: string;
  backend: string;
  files: number;
  chunks: number;
  dirty: boolean;
  vectorAvailable: boolean;
  ftsAvailable: boolean;
}

export interface SecurityFinding {
  checkId: string;
  severity: string;
  title: string;
  detail: string;
  remediation: string;
}

export interface SystemOverview {
  gateway: GatewayStatus;
  agents: OpenClawAgent[];
  sessions: SessionInfo[];
  channels: ChannelHealth[];
  memory: MemoryStatus;
  security: SecurityFinding[];
  os: Record<string, string>;
  update: Record<string, unknown>;
  totalSessions: number;
  healthOk: boolean;
}

export interface MetricsSummary {
  totalAgents: number;
  totalSessions: number;
  totalChannels: number;
  channelsHealthy: number;
  gatewayReachable: boolean;
  gatewayLatencyMs: number;
  securityCritical: number;
  securityWarnings: number;
  memoryChunks: number;
  memoryFiles: number;
}
