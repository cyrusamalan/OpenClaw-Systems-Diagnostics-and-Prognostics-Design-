"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, MessageSquare, Radio, Cpu, Clock, Crown, Tag, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboardStore } from "@/store/agent-store";
import { cn } from "@/lib/utils";
import type { SystemOverview } from "@/types/agent";

interface DetailPanelProps {
  overview: SystemOverview;
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

export function DetailPanel({ overview }: DetailPanelProps) {
  const {
    detailPanelOpen,
    detailPanelContent,
    selectedAgentId,
    selectedSessionId,
    selectedChannelId,
    closeDetailPanel,
  } = useDashboardStore();

  const agent =
    detailPanelContent === "agent"
      ? overview.agents.find((a) => a.id === selectedAgentId)
      : null;

  const session =
    detailPanelContent === "session"
      ? overview.sessions.find((s) => s.sessionId === selectedSessionId)
      : null;

  const channel =
    detailPanelContent === "channel"
      ? overview.channels.find((c) => c.channelId === selectedChannelId)
      : null;

  return (
    <AnimatePresence>
      {detailPanelOpen && (agent || session || channel) && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeDetailPanel}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l bg-background shadow-2xl"
          >
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {agent && (
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{agent.identityEmoji}</span>
                        {agent.identityName}
                      </span>
                    )}
                    {session && "Session Detail"}
                    {channel && `${channel.name} Channel`}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={closeDetailPanel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Agent detail */}
                {agent && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      {agent.isDefault && (
                        <Badge variant="default" className="gap-1">
                          <Crown className="h-3 w-3" /> Default Agent
                        </Badge>
                      )}
                      {agent.heartbeatEnabled && (
                        <Badge variant="secondary">♥ {agent.heartbeatEvery}</Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <DetailRow icon={Cpu} label="Model" value={agent.model} mono />
                      <DetailRow icon={Tag} label="Agent ID" value={agent.id} mono />
                      <DetailRow icon={FolderOpen} label="Workspace" value={agent.workspace} mono />
                      <DetailRow icon={FolderOpen} label="Agent Dir" value={agent.agentDir} mono />
                      <DetailRow icon={MessageSquare} label="Sessions" value={String(agent.sessionsCount)} />
                      <DetailRow icon={Clock} label="Last Active" value={formatAge(agent.lastActiveAgeMs)} />
                      <DetailRow icon={Radio} label="Bindings" value={String(agent.bindings)} />
                    </div>

                    {agent.routes.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-semibold mb-2">Routes</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {agent.routes.map((r, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-mono">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Session detail */}
                {session && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{session.kind}</Badge>
                      {session.flags.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs font-mono">
                          {f}
                        </Badge>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <DetailRow icon={Tag} label="Session ID" value={session.sessionId} mono />
                      <DetailRow icon={Tag} label="Key" value={session.key} mono />
                      <DetailRow icon={Bot} label="Agent" value={session.agentId} mono />
                      <DetailRow icon={Cpu} label="Model" value={session.model} mono />
                      <DetailRow icon={Clock} label="Last Active" value={formatAge(session.age)} />
                    </div>

                    <Separator />

                    <h3 className="text-sm font-semibold">Token Usage</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <MetricBox label="Input" value={formatTokens(session.inputTokens)} />
                      <MetricBox label="Output" value={formatTokens(session.outputTokens)} />
                      <MetricBox label="Total" value={formatTokens(session.totalTokens)} />
                      <MetricBox label="Remaining" value={formatTokens(session.remainingTokens)} />
                    </div>

                    {session.percentUsed != null && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Context window</span>
                          <span className="font-mono">{session.percentUsed}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              session.percentUsed > 80
                                ? "bg-status-error"
                                : session.percentUsed > 50
                                  ? "bg-status-idle"
                                  : "bg-status-active"
                            )}
                            style={{ width: `${session.percentUsed}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {formatTokens(session.contextTokens)} context window
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Channel detail */}
                {channel && (
                  <div className="space-y-5">
                    <div className="flex gap-2">
                      <Badge variant={channel.probeOk ? "active" : "error"}>
                        {channel.probeOk ? "Healthy" : "Unhealthy"}
                      </Badge>
                      <Badge variant={channel.configured ? "secondary" : "error"}>
                        {channel.configured ? "Configured" : "Not configured"}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <DetailRow icon={Tag} label="Channel" value={channel.channelId} mono />
                      <DetailRow icon={Tag} label="Account" value={channel.accountId} mono />
                      {channel.botUsername && (
                        <DetailRow icon={Bot} label="Bot" value={channel.botUsername} mono />
                      )}
                      {channel.botId && (
                        <DetailRow icon={Tag} label="Bot ID" value={channel.botId} mono />
                      )}
                      {channel.probeElapsedMs != null && (
                        <DetailRow icon={Clock} label="Probe Latency" value={`${channel.probeElapsedMs}ms`} />
                      )}
                      {channel.lastError && (
                        <div className="bg-status-error/10 text-status-error rounded-lg p-3 text-xs">
                          {channel.lastError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("text-sm break-all", mono && "font-mono")}>{value}</div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
    </div>
  );
}
