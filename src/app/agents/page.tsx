"use client";

import { useState, useCallback } from "react";
import { useDashboardStore } from "@/store/agent-store";
import { useOverview } from "@/hooks/use-agents";
import { AgentTree } from "@/components/agents/agent-tree";
import { SessionPanel } from "@/components/agents/session-panel";
import { DetailPanel } from "@/components/agents/detail-panel";
import { AddAgentDialog } from "@/components/agents/add-agent-dialog";
import { Bot, Loader2 } from "lucide-react";

export default function AgentsPage() {
  const overview = useDashboardStore((s) => s.overview);
  const { refetch } = useOverview(5000);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleAgentCreated = useCallback(() => {
    setTimeout(() => refetch(), 1500);
  }, [refetch]);

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-mono">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Agents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {overview.agents.length} registered agent
            {overview.agents.length !== 1 ? "s" : ""} ·{" "}
            {overview.sessions.length} session
            {overview.sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddAgentDialog onCreated={handleAgentCreated} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start"
        style={{ minHeight: "calc(100vh - 220px)" }}
      >
        <AgentTree
          agents={overview.agents}
          sessions={overview.sessions}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
        />

        <SessionPanel
          sessions={overview.sessions}
          agents={overview.agents}
          selectedAgentId={selectedAgentId}
        />
      </div>

      <DetailPanel overview={overview} />
    </div>
  );
}
