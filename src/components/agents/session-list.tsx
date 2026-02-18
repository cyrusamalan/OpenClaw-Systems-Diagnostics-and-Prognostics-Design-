"use client";

import { MessageSquare, Radio, Users, Cpu, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { SessionInfo } from "@/types/agent";

interface SessionListProps {
  sessions: SessionInfo[];
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

export function SessionList({ sessions }: SessionListProps) {
  const openSessionDetail = useDashboardStore((s) => s.openSessionDetail);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Sessions ({sessions.length})
      </h2>
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const KindIcon = kindIcons[session.kind] || MessageSquare;
          return (
            <Card
              key={session.sessionId}
              className="cursor-pointer transition-all duration-200 hover:border-primary/40"
              onClick={() => openSessionDetail(session.sessionId)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                      <KindIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate font-mono">
                          {session.key}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5 shrink-0"
                        >
                          {session.kind}
                        </Badge>
                        {session.systemSent && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1.5 shrink-0"
                          >
                            system
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Cpu className="h-3 w-3" />
                        <span className="font-mono">{session.model}</span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>{formatAge(session.age)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground">Tokens</div>
                      <div className="text-sm font-mono font-medium">
                        {formatTokens(session.totalTokens)}
                      </div>
                    </div>
                    {session.percentUsed != null && (
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Context
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                session.percentUsed > 80
                                  ? "bg-status-error"
                                  : session.percentUsed > 50
                                    ? "bg-status-idle"
                                    : "bg-status-active"
                              )}
                              style={{ width: `${session.percentUsed}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">
                            {session.percentUsed}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
