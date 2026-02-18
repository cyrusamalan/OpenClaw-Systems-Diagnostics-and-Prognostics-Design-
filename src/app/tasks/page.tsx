"use client";

import { useDashboardStore } from "@/store/agent-store";
import { useOverview } from "@/hooks/use-agents";
import { SessionList } from "@/components/agents/session-list";
import { ChannelList } from "@/components/agents/channel-list";
import { DetailPanel } from "@/components/agents/detail-panel";
import { ListTodo, Loader2 } from "lucide-react";

export default function TasksPage() {
  const overview = useDashboardStore((s) => s.overview);
  useOverview(5000);

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-mono">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-primary" />
          Sessions & Channels
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Active conversations and connected channels
        </p>
      </div>

      <SessionList sessions={overview.sessions} />
      <ChannelList channels={overview.channels} />

      <DetailPanel overview={overview} />
    </div>
  );
}
