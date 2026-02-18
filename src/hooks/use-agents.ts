"use client";

import { useEffect, useCallback, useRef } from "react";
import { useDashboardStore } from "@/store/agent-store";
import { useConnectionStore } from "@/store/connection-store";
import { OpenClawClient } from "@/lib/openclaw-client";

export function useOverview(pollIntervalMs = 5000) {
  const setOverview = useDashboardStore((s) => s.setOverview);
  const config = useConnectionStore((s) => s.config);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const clientRef = useRef<OpenClawClient | null>(null);

  useEffect(() => {
    clientRef.current = new OpenClawClient(config);
  }, [config]);

  const fetchOverview = useCallback(async () => {
    if (!clientRef.current) return;
    try {
      const data = await clientRef.current.getOverview();
      setOverview(data);
      setStatus(data.gateway?.reachable ? "connected" : "error");
    } catch {
      setStatus("error");
    }
  }, [setOverview, setStatus]);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchOverview, pollIntervalMs]);

  return { refetch: fetchOverview };
}
