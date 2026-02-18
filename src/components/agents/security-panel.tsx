"use client";

import { ShieldAlert, AlertTriangle, Info, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SecurityFinding } from "@/types/agent";

interface SecurityPanelProps {
  findings: SecurityFinding[];
}

const severityConfig: Record<
  string,
  { icon: React.ElementType; variant: "error" | "idle" | "secondary"; label: string }
> = {
  critical: { icon: ShieldX, variant: "error", label: "Critical" },
  warn: { icon: AlertTriangle, variant: "idle", label: "Warning" },
  info: { icon: Info, variant: "secondary", label: "Info" },
};

export function SecurityPanel({ findings }: SecurityPanelProps) {
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warnCount = findings.filter((f) => f.severity === "warn").length;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-primary" />
        Security Audit
        {criticalCount > 0 && (
          <Badge variant="error">{criticalCount} critical</Badge>
        )}
        {warnCount > 0 && (
          <Badge variant="idle">{warnCount} warnings</Badge>
        )}
      </h2>
      <div className="flex flex-col gap-2">
        {findings.map((finding) => {
          const config = severityConfig[finding.severity] || severityConfig.info;
          const SevIcon = config.icon;
          return (
            <Card key={finding.checkId}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <SevIcon
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      finding.severity === "critical" && "text-status-error",
                      finding.severity === "warn" && "text-status-idle",
                      finding.severity === "info" && "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {finding.title}
                      </span>
                      <Badge variant={config.variant} className="text-[10px] h-4 px-1.5">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {finding.detail}
                    </p>
                    {finding.remediation && (
                      <p className="text-xs text-muted-foreground mt-1.5 bg-secondary/50 rounded p-2">
                        {finding.remediation}
                      </p>
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
