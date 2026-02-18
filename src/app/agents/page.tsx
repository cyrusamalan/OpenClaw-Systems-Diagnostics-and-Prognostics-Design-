"use client";

import { useDashboardStore } from "@/store/agent-store";
import { useOverview } from "@/hooks/use-agents";
import { AgentCard } from "@/components/agents/agent-card";
import { SessionList } from "@/components/agents/session-list";
import { DetailPanel } from "@/components/agents/detail-panel";
import { Bot, Loader2 } from "lucide-react";

export default function AgentsPage() {
  const overview = useDashboardStore((s) => s.overview);
  useOverview(5000);

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-mono">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          Agents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {overview.agents.length} registered agent{overview.agents.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {overview.agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <SessionList sessions={overview.sessions} />

      <DetailPanel overview={overview} />
    </div>
  );
}
