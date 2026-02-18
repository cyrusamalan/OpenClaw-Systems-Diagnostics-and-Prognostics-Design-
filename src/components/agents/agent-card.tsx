"use client";

import { motion } from "framer-motion";
import { Crown, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { OpenClawAgent } from "@/types/agent";

interface AgentCardProps {
  agent: OpenClawAgent;
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

export function AgentCard({ agent }: AgentCardProps) {
  const openAgentDetail = useDashboardStore((s) => s.openAgentDetail);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
        onClick={() => openAgentDetail(agent.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-2xl",
                agent.isDefault
                  ? "bg-primary/10 border-primary/20"
                  : "bg-secondary border-border"
              )}
            >
              {agent.identityEmoji || "🤖"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">
                  {agent.identityName || agent.id}
                </h3>
                {agent.isDefault && (
                  <Crown className="h-3.5 w-3.5 text-primary" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] h-5 font-mono">
                  {agent.model}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {agent.sessionsCount} sessions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatAge(agent.lastActiveAgeMs)}
                </span>
                {agent.heartbeatEnabled && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5"
                  >
                    ♥ {agent.heartbeatEvery}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
