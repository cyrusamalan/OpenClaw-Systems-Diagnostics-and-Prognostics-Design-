"use client";

import { MessageSquare, Radio, Users, Cpu, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { SessionInfo, OpenClawAgent } from "@/types/agent";

interface SessionPanelProps {
  sessions: SessionInfo[];
  agents: OpenClawAgent[];
  selectedAgentId: string | null;
}

function formatAge(ms: number | null): string {
  if (ms == null) return "—";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTokens(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const kindIcons: Record<string, React.ElementType> = {
  direct: Radio,
  group: Users,
};

function SessionRow({ session, agentName }: { session: SessionInfo; agentName: string }) {
  const openSessionDetail = useDashboardStore((s) => s.openSessionDetail);
  const KindIcon = kindIcons[session.kind] || MessageSquare;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-accent/50 border border-transparent hover:border-border"
      onClick={() => openSessionDetail(session.sessionId)}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-secondary">
        <KindIcon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-medium truncate font-mono">
            {session.key}
          </span>
          <Badge variant="secondary" className="text-[9px] h-3.5 px-1 shrink-0">
            {session.kind}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">{agentName}</span>
          <span className="shrink-0">·</span>
          <Cpu className="h-2.5 w-2.5 shrink-0" />
          <span className="font-mono truncate">{session.model}</span>
        </div>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground justify-end">
          <Clock className="h-2.5 w-2.5" />
          {formatAge(session.age)}
        </div>
        <div className="text-xs font-mono">
          {formatTokens(session.totalTokens)}
          {session.percentUsed != null && (
            <span
              className={cn(
                "ml-1",
                session.percentUsed > 80
                  ? "text-status-error"
                  : session.percentUsed > 50
                    ? "text-status-idle"
                    : "text-muted-foreground"
              )}
            >
              ({session.percentUsed}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SessionPanel({
  sessions,
  agents,
  selectedAgentId,
}: SessionPanelProps) {
  const filtered = selectedAgentId
    ? sessions.filter((s) => s.agentId === selectedAgentId)
    : sessions;

  const agentNameMap = new Map(
    agents.map((a) => [a.id, a.identityName || a.id])
  );

  const selectedAgent = selectedAgentId
    ? agents.find((a) => a.id === selectedAgentId)
    : null;

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-3 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <MessageSquare className="h-4 w-4" />
            Sessions
          </h2>
          <Badge variant="outline" className="text-[10px] h-5 font-mono">
            {filtered.length}
            {selectedAgent && (
              <span className="ml-1 text-muted-foreground">
                / {sessions.length}
              </span>
            )}
          </Badge>
        </div>

        {selectedAgent && (
          <div className="mx-2 mb-2 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
            Filtered to{" "}
            <span className="font-medium text-foreground">
              {selectedAgent.identityEmoji} {selectedAgent.identityName || selectedAgent.id}
            </span>
          </div>
        )}

        <ScrollArea className="flex-1 -mx-1 px-1">
          <div className="space-y-0.5">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No sessions
                {selectedAgent ? " for this agent" : ""}
              </div>
            ) : (
              filtered.map((session) => (
                <SessionRow
                  key={session.sessionId}
                  session={session}
                  agentName={agentNameMap.get(session.agentId) || session.agentId}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
