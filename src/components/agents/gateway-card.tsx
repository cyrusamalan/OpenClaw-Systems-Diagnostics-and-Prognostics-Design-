"use client";

import {
  Server,
  Wifi,
  WifiOff,
  Clock,
  Globe,
  HardDrive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GatewayStatus } from "@/types/agent";

interface GatewayCardProps {
  gateway: GatewayStatus;
}

export function GatewayCard({ gateway }: GatewayCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          Gateway
          <Badge
            variant={gateway.reachable ? "active" : "error"}
            className="ml-auto"
          >
            {gateway.reachable ? "Reachable" : "Unreachable"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {gateway.reachable ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              URL
            </div>
            <div className="font-mono text-xs">{gateway.url}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Latency
            </div>
            <div className="font-mono text-xs">
              {gateway.connectLatencyMs != null
                ? `${gateway.connectLatencyMs}ms`
                : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Host
            </div>
            <div className="font-mono text-xs">
              {gateway.host}{" "}
              <span className="text-muted-foreground">({gateway.ip})</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Service
            </div>
            <div
              className={cn(
                "font-mono text-xs",
                gateway.serviceRunning.includes("running")
                  ? "text-status-active"
                  : "text-status-error"
              )}
            >
              {gateway.serviceRunning || "Unknown"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
