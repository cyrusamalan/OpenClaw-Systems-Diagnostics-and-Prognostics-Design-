"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Network,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { OpenClawAgent, SessionInfo } from "@/types/agent";

interface AgentTreeProps {
  agents: OpenClawAgent[];
  sessions: SessionInfo[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
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

function AgentNode({
  agent,
  sessions,
  isMain,
  isSelected,
  onSelect,
}: {
  agent: OpenClawAgent;
  sessions: SessionInfo[];
  isMain: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(isMain);
  const openAgentDetail = useDashboardStore((s) => s.openAgentDetail);
  const agentSessions = sessions.filter((s) => s.agentId === agent.id);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150",
          "hover:bg-accent/50",
          isSelected && "bg-primary/10 border border-primary/20",
          !isSelected && "border border-transparent"
        )}
        onClick={onSelect}
      >
        <button
          className="shrink-0 p-0.5 rounded hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl",
            isMain
              ? "bg-primary/10 border-primary/30"
              : "bg-secondary border-border"
          )}
        >
          {agent.identityEmoji || "🤖"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">
              {agent.identityName || agent.id}
            </span>
            {isMain && <Crown className="h-3.5 w-3.5 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
              {agent.model}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {agent.sessionsCount}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatAge(agent.lastActiveAgeMs)}
            </span>
          </div>
        </div>

        <button
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation();
            openAgentDetail(agent.id);
          }}
        >
          Details
        </button>
      </div>

      <AnimatePresence>
        {expanded && agentSessions.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-6 pl-4 border-l border-border/50 space-y-1 py-1">
              {agentSessions.map((session) => (
                <SubSessionNode key={session.sessionId} session={session} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubSessionNode({ session }: { session: SessionInfo }) {
  const openSessionDetail = useDashboardStore((s) => s.openSessionDetail);

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/40 transition-colors text-sm"
      onClick={() => openSessionDetail(session.sessionId)}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
      <span className="font-mono text-xs truncate text-muted-foreground">
        {session.key}
      </span>
      <Badge variant="secondary" className="text-[9px] h-3.5 px-1 shrink-0">
        {session.kind}
      </Badge>
    </div>
  );
}

export function AgentTree({
  agents,
  sessions,
  selectedAgentId,
  onSelectAgent,
}: AgentTreeProps) {
  const mainAgents = agents.filter((a) => a.isDefault);
  const subAgents = agents.filter((a) => !a.isDefault);

  return (
    <Card className="h-full">
      <CardContent className="p-3">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 px-2 text-muted-foreground uppercase tracking-wider">
          <Network className="h-4 w-4" />
          Agent Hierarchy
        </h2>

        <div className="space-y-1">
          {mainAgents.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              sessions={sessions}
              isMain={true}
              isSelected={selectedAgentId === agent.id}
              onSelect={() =>
                onSelectAgent(selectedAgentId === agent.id ? null : agent.id)
              }
            />
          ))}

          {subAgents.length > 0 && (
            <div className="ml-4 border-l-2 border-primary/20 pl-2 space-y-1 mt-1">
              {subAgents.map((agent) => (
                <AgentNode
                  key={agent.id}
                  agent={agent}
                  sessions={sessions}
                  isMain={false}
                  isSelected={selectedAgentId === agent.id}
                  onSelect={() =>
                    onSelectAgent(
                      selectedAgentId === agent.id ? null : agent.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
