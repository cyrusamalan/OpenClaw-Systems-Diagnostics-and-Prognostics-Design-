import { create } from "zustand";
import type {
  ConnectionConfig,
  ConnectionStatus,
  ConnectionState,
} from "@/types/connection";

interface ConnectionStore extends ConnectionState {
  setConfig: (config: Partial<ConnectionConfig>) => void;
  setStatus: (status: ConnectionStatus) => void;
  connect: () => void;
  disconnect: () => void;
}

const defaultConfig: ConnectionConfig = {
  host: process.env.NEXT_PUBLIC_OPENCLAW_HOST ?? "localhost",
  port: Number(process.env.NEXT_PUBLIC_OPENCLAW_PORT ?? 8080),
  apiKey: process.env.NEXT_PUBLIC_OPENCLAW_API_KEY ?? "",
  connectionType: "rest",
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  config: defaultConfig,
  status: "connecting",
  lastConnected: null,
  retryCount: 0,

  setConfig: (patch) =>
    set((state) => ({ config: { ...state.config, ...patch } })),

  setStatus: (status) => set({ status }),

  connect: () =>
    set({ status: "connecting", retryCount: 0 }),

  disconnect: () =>
    set({ status: "disconnected" }),
}));
