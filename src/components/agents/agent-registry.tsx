"use client";

import { useDashboardStore } from "@/store/agent-store";
import { useOverview } from "@/hooks/use-agents";
import { GatewayCard } from "./gateway-card";
import { AgentCard } from "./agent-card";
import { SessionList } from "./session-list";
import { ChannelList } from "./channel-list";
import { SecurityPanel } from "./security-panel";
import { MetricsBar } from "./metrics-bar";
import { DetailPanel } from "./detail-panel";
import { Satellite, Loader2 } from "lucide-react";

export function AgentRegistry() {
  const overview = useDashboardStore((s) => s.overview);
  useOverview(5000);

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-mono">Connecting to OpenClaw Gateway...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Satellite className="h-6 w-6 text-primary" />
          Mission Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          OpenClaw Gateway · {overview.gateway.host} · {overview.gateway.url}
        </p>
      </div>

      {/* Metrics bar */}
      <MetricsBar overview={overview} />

      {/* Gateway status */}
      <GatewayCard gateway={overview.gateway} />

      {/* Agents */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Agents</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {overview.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Sessions */}
      <SessionList sessions={overview.sessions} />

      {/* Channels */}
      <ChannelList channels={overview.channels} />

      {/* Security */}
      {overview.security.length > 0 && (
        <SecurityPanel findings={overview.security} />
      )}

      {/* Detail panel */}
      <DetailPanel overview={overview} />
    </div>
  );
}
