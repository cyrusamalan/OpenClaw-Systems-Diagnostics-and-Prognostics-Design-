"use client";

import {
  Bot,
  MessageSquare,
  Radio,
  Wifi,
  Clock,
  Shield,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemOverview } from "@/types/agent";

interface MetricsBarProps {
  overview: SystemOverview;
}

interface MetricItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
}

function MetricItem({ icon: Icon, label, value, sub, alert }: MetricItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 bg-card">
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          alert ? "text-status-error" : "text-muted-foreground"
        )}
      />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-bold font-mono">
          {value}
          {sub && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MetricsBar({ overview }: MetricsBarProps) {
  const criticalFindings = overview.security.filter(
    (f) => f.severity === "critical"
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      <MetricItem
        icon={Wifi}
        label="Gateway"
        value={overview.gateway.reachable ? "Online" : "Offline"}
        sub={
          overview.gateway.connectLatencyMs != null
            ? `${overview.gateway.connectLatencyMs}ms`
            : undefined
        }
        alert={!overview.gateway.reachable}
      />
      <MetricItem
        icon={Bot}
        label="Agents"
        value={overview.agents.length}
      />
      <MetricItem
        icon={MessageSquare}
        label="Sessions"
        value={overview.totalSessions}
      />
      <MetricItem
        icon={Radio}
        label="Channels"
        value={overview.channels.length}
        sub={
          overview.channels.filter((c) => c.probeOk).length ===
          overview.channels.length
            ? "all healthy"
            : undefined
        }
      />
      <MetricItem
        icon={Shield}
        label="Security"
        value={criticalFindings > 0 ? `${criticalFindings} critical` : "OK"}
        alert={criticalFindings > 0}
      />
      <MetricItem
        icon={Database}
        label="Memory"
        value={overview.memory.chunks}
        sub="chunks"
      />
      <MetricItem
        icon={Clock}
        label="Health"
        value={overview.healthOk ? "Healthy" : "Degraded"}
        alert={!overview.healthOk}
      />
    </div>
  );
}
