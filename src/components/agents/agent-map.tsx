"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { OpenClawAgent, SessionInfo } from "@/types/agent";

interface AgentMapProps {
  agents: OpenClawAgent[];
  sessions: SessionInfo[];
}

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;

interface MapEntity {
  id: string;
  label: string;
  emoji: string;
  model: string;
  tier: "main" | "agent-sub" | "spawned-sub";
  working: boolean;
  parentName: string | null;
  onClick: () => void;
}

function buildEntities(
  agents: OpenClawAgent[],
  sessions: SessionInfo[],
  openAgentDetail: (id: string) => void,
  openSessionDetail: (id: string) => void
): MapEntity[] {
  const entities: MapEntity[] = [];
  const agentNameMap = new Map(agents.map((a) => [a.id, a.identityName || a.id]));

  for (const agent of agents) {
    const working =
      agent.lastActiveAgeMs != null && agent.lastActiveAgeMs < ACTIVE_THRESHOLD_MS;
    entities.push({
      id: `agent:${agent.id}`,
      label: agent.identityName || agent.id,
      emoji: agent.identityEmoji || "🤖",
      model: agent.model,
      tier: agent.isDefault ? "main" : "agent-sub",
      working,
      parentName: agent.isDefault ? null : (agentNameMap.get(agents.find(a => a.isDefault)?.id || "") || "main"),
      onClick: () => openAgentDetail(agent.id),
    });
  }

  for (const session of sessions) {
    if (!session.key.includes("subagent")) continue;
    const parts = session.key.split(":");
    const shortId = parts[parts.length - 1]?.slice(0, 8) || "sub";
    const working = session.age != null && session.age < ACTIVE_THRESHOLD_MS;
    const parentName = agentNameMap.get(session.agentId) || session.agentId;

    entities.push({
      id: `session:${session.sessionId}`,
      label: shortId,
      emoji: "🔧",
      model: session.model,
      tier: "spawned-sub",
      working,
      parentName,
      onClick: () => openSessionDetail(session.sessionId),
    });
  }

  return entities;
}

const tierConfig = {
  main: {
    box: "h-20 w-20 rounded-2xl",
    emoji: "text-3xl",
    labelText: "text-[11px]",
    maxLabel: 100,
  },
  "agent-sub": {
    box: "h-14 w-14 rounded-xl",
    emoji: "text-xl",
    labelText: "text-[9px]",
    maxLabel: 80,
  },
  "spawned-sub": {
    box: "h-10 w-10 rounded-lg",
    emoji: "text-sm",
    labelText: "text-[8px]",
    maxLabel: 60,
  },
};

function RobotAvatar({
  entity,
  index,
  total,
}: {
  entity: MapEntity;
  index: number;
  total: number;
}) {
  const cfg = tierConfig[entity.tier];
  const isSub = entity.tier !== "main";
  const isSpawned = entity.tier === "spawned-sub";

  const cols = Math.min(total, 4);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const offsetX = cols === 1 ? 50 : 15 + (col / (cols - 1)) * 70;
  const offsetY = total <= 4 ? 50 : 20 + (row / Math.ceil(total / cols)) * 60;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1 cursor-pointer group"
      style={{
        left: `${offsetX}%`,
        top: `${offsetY}%`,
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{ scale: 1.12, y: -4 }}
      onClick={entity.onClick}
    >
      <div
        className={cn(
          "relative flex items-center justify-center border-2 transition-shadow",
          cfg.box,
          entity.working
            ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
            : "bg-slate-500/10 border-slate-500/30 shadow-md shadow-slate-500/5",
          "group-hover:shadow-xl"
        )}
      >
        <span className={cfg.emoji}>{entity.emoji}</span>

        {entity.working && (
          <span
            className={cn(
              "absolute inset-0 animate-ping bg-emerald-500/10 pointer-events-none",
              cfg.box
            )}
          />
        )}

        {!entity.working && (
          <span className="absolute -top-1 -right-1 text-[10px] text-slate-400 animate-pulse">
            💤
          </span>
        )}

        {isSub && (
          <span
            className={cn(
              "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-background border border-border font-mono font-bold",
              isSpawned
                ? "h-3 w-3 text-[6px]"
                : "h-4 w-4 text-[7px]"
            )}
          >
            {isSpawned ? "s" : "sub"}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center">
        <span
          className={cn(
            "font-semibold leading-tight text-center truncate",
            cfg.labelText
          )}
          style={{ maxWidth: cfg.maxLabel }}
        >
          {entity.label}
        </span>
        <span
          className="text-[8px] text-muted-foreground font-mono truncate"
          style={{ maxWidth: cfg.maxLabel }}
        >
          {entity.model.split("/").pop()}
        </span>
        {entity.tier === "agent-sub" && (
          <Badge variant="outline" className="text-[7px] h-3 px-1 mt-0.5">
            sub-agent
          </Badge>
        )}
        {entity.tier === "spawned-sub" && entity.parentName && (
          <span className="text-[7px] text-muted-foreground/60 mt-0.5">
            via {entity.parentName}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AgentMap({ agents, sessions }: AgentMapProps) {
  const openAgentDetail = useDashboardStore((s) => s.openAgentDetail);
  const openSessionDetail = useDashboardStore((s) => s.openSessionDetail);

  const { working, sleeping } = useMemo(() => {
    const all = buildEntities(agents, sessions, openAgentDetail, openSessionDetail);
    const w = all.filter((e) => e.working);
    const s = all.filter((e) => !e.working);
    return { working: w, sleeping: s };
  }, [agents, sessions, openAgentDetail, openSessionDetail]);

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        {/* Working zone */}
        <div className="relative border-b md:border-b-0 md:border-r border-border bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/3">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                Working
              </span>
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1.5 ml-1"
              >
                {working.length}
              </Badge>
            </div>
          </div>

          <div className="relative w-full min-h-[250px] md:min-h-[500px] p-8 pt-14">
            {working.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50">
                No active agents
              </div>
            ) : (
              working.map((entity, i) => (
                <RobotAvatar
                  key={entity.id}
                  entity={entity}
                  index={i}
                  total={working.length}
                />
              ))
            )}
          </div>
        </div>

        {/* Sleeping zone */}
        <div className="relative bg-gradient-to-br from-slate-500/5 via-transparent to-indigo-500/3">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
              <Moon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">
                Sleeping
              </span>
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1.5 ml-1"
              >
                {sleeping.length}
              </Badge>
            </div>
          </div>

          <div className="relative w-full min-h-[250px] md:min-h-[500px] p-8 pt-14">
            {sleeping.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground/50">
                All agents are working
              </div>
            ) : (
              sleeping.map((entity, i) => (
                <RobotAvatar
                  key={entity.id}
                  entity={entity}
                  index={i}
                  total={sleeping.length}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
