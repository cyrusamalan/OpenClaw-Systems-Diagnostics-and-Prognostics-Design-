"use client";

import { Radio, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/agent-store";
import type { ChannelHealth } from "@/types/agent";

interface ChannelListProps {
  channels: ChannelHealth[];
}

export function ChannelList({ channels }: ChannelListProps) {
  const openChannelDetail = useDashboardStore((s) => s.openChannelDetail);

  if (channels.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
        Channels ({channels.length})
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card
            key={`${channel.channelId}-${channel.accountId}`}
            className="cursor-pointer transition-all duration-200 hover:border-primary/40"
            onClick={() => openChannelDetail(channel.channelId)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{channel.name}</h3>
                <Badge
                  variant={channel.probeOk ? "active" : "error"}
                  className="text-[10px]"
                >
                  {channel.probeOk ? "Healthy" : "Unhealthy"}
                </Badge>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {channel.botUsername && (
                  <div className="flex items-center gap-1.5">
                    <span>Bot:</span>
                    <span className="font-mono font-medium text-foreground">
                      {channel.botUsername}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    {channel.configured ? (
                      <CheckCircle2 className="h-3 w-3 text-status-active" />
                    ) : (
                      <XCircle className="h-3 w-3 text-status-error" />
                    )}
                    {channel.configured ? "Configured" : "Not configured"}
                  </span>
                  {channel.probeElapsedMs != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {channel.probeElapsedMs}ms
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
