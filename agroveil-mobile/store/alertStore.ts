import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  offlineQueue: Alert[];
  unreadCount: number;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncAt: string | null;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
  enqueueOffline: (alert: Alert) => void;
  clearQueue: () => void;
  setIsSyncing: (syncing: boolean) => void;
  setIsOnline: (online: boolean) => void;
  markSynced: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  offlineQueue: [],
  unreadCount: 0,
  isSyncing: false,
  isOnline: true,
  lastSyncAt: null,

  setAlerts: (alerts) =>
    set({ alerts, unreadCount: alerts.filter((a) => !a.isResolved).length }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, isResolved: true, resolvedAt: new Date().toISOString() } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  enqueueOffline: (alert) =>
    set((state) => ({ offlineQueue: [...state.offlineQueue, alert] })),

  clearQueue: () => set({ offlineQueue: [] }),

  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setIsOnline: (isOnline) => set({ isOnline }),
  markSynced: () => set({ lastSyncAt: new Date().toISOString(), isSyncing: false }),
}));
