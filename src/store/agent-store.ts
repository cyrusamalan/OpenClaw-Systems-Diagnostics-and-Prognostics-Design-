import { create } from "zustand";
import type { SystemOverview } from "@/types/agent";

interface DashboardStore {
  overview: SystemOverview | null;
  selectedAgentId: string | null;
  detailPanelOpen: boolean;
  detailPanelContent: "agent" | "session" | "channel" | null;
  selectedSessionId: string | null;
  selectedChannelId: string | null;

  setOverview: (overview: SystemOverview) => void;
  openAgentDetail: (id: string) => void;
  openSessionDetail: (id: string) => void;
  openChannelDetail: (id: string) => void;
  closeDetailPanel: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  overview: null,
  selectedAgentId: null,
  detailPanelOpen: false,
  detailPanelContent: null,
  selectedSessionId: null,
  selectedChannelId: null,

  setOverview: (overview) => set({ overview }),

  openAgentDetail: (id) =>
    set({
      selectedAgentId: id,
      detailPanelOpen: true,
      detailPanelContent: "agent",
    }),

  openSessionDetail: (id) =>
    set({
      selectedSessionId: id,
      detailPanelOpen: true,
      detailPanelContent: "session",
    }),

  openChannelDetail: (id) =>
    set({
      selectedChannelId: id,
      detailPanelOpen: true,
      detailPanelContent: "channel",
    }),

  closeDetailPanel: () =>
    set({ detailPanelOpen: false }),
}));
