export type ConnectionType = "rest" | "websocket";
export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

export interface ConnectionConfig {
  host: string;
  port: number;
  apiKey: string;
  connectionType: ConnectionType;
}

export interface ConnectionState {
  config: ConnectionConfig;
  status: ConnectionStatus;
  lastConnected: string | null;
  retryCount: number;
}
