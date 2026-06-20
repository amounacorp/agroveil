import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  offlineQueue: Alert[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  unreadCount: number;

  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (ts: string) => void;
  markAllRead: () => void;
  resolveAlert: (id: string) => void;
  enqueueOffline: (alert: Alert) => void;
  dequeueOffline: () => Alert | undefined;
  clearOfflineQueue: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  offlineQueue: [],
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  unreadCount: 0,

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1,
    })),

  setOnline: (online) => set({ isOnline: online }),

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  setLastSyncAt: (ts) => set({ lastSyncAt: ts }),

  markAllRead: () => set({ unreadCount: 0 }),

  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, isResolved: true, resolvedAt: new Date().toISOString() } : a,
      ),
    })),

  enqueueOffline: (alert) =>
    set((state) => {
      if (state.offlineQueue.find((a) => a.id === alert.id)) return state;
      return { offlineQueue: [...state.offlineQueue, alert] };
    }),

  dequeueOffline: () => {
    const queue = get().offlineQueue;
    if (queue.length === 0) return undefined;
    const [first, ...rest] = queue;
    set({ offlineQueue: rest });
    return first;
  },

  clearOfflineQueue: () => set({ offlineQueue: [] }),
}));
