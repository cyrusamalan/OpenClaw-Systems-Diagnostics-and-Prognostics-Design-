import type { SystemOverview, MetricsSummary } from "@/types/agent";
import type { ConnectionConfig } from "@/types/connection";

function buildBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return "http://localhost:8080/api";
}

export class OpenClawClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(config: ConnectionConfig) {}

  private get baseUrl(): string {
    return buildBaseUrl();
  }

  async getOverview(): Promise<SystemOverview> {
    const res = await fetch(`${this.baseUrl}/overview`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async getAgents(): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl}/agents`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async getSessions(): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl}/sessions`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async getChannels(): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl}/channels`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async getMetrics(): Promise<MetricsSummary> {
    const res = await fetch(`${this.baseUrl}/metrics`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async getLogs(limit = 100): Promise<unknown[]> {
    const res = await fetch(`${this.baseUrl}/logs?limit=${limit}`);
    if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
    return res.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === "ok";
    } catch {
      return false;
    }
  }

  createLogStream(): EventSource {
    return new EventSource(`${this.baseUrl}/logs/stream`);
  }
}
