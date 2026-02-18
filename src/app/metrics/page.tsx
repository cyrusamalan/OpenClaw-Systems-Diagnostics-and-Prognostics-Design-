"use client";

import { useDashboardStore } from "@/store/agent-store";
import { useOverview } from "@/hooks/use-agents";
import { MetricsBar } from "@/components/agents/metrics-bar";
import { GatewayCard } from "@/components/agents/gateway-card";
import { SecurityPanel } from "@/components/agents/security-panel";
import { Activity, Loader2 } from "lucide-react";

export default function MetricsPage() {
  const overview = useDashboardStore((s) => s.overview);
  useOverview(5000);

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-mono">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Metrics & Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          System health and performance overview
        </p>
      </div>

      <MetricsBar overview={overview} />
      <GatewayCard gateway={overview.gateway} />

      {overview.memory && (
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Memory Backend" value={overview.memory.backend} />
          <StatCard label="Indexed Files" value={String(overview.memory.files)} />
          <StatCard label="Chunks" value={String(overview.memory.chunks)} />
        </div>
      )}

      {overview.security.length > 0 && (
        <SecurityPanel findings={overview.security} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
    </div>
  );
}
