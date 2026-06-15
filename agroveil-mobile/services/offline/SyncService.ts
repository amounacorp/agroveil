import { useAlertStore } from '../../store/alertStore';
import { AlertQueue } from './AlertQueue';
import { apiClient } from '../api/client';
import { Endpoints } from '../../constants/api';

let unsubscribe: (() => void) | null = null;

export const SyncService = {
  start(): void {
    if (unsubscribe) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const NetInfo = require('@react-native-community/netinfo').default;
      unsubscribe = NetInfo.addEventListener(async (state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        useAlertStore.getState().setIsOnline(online);
        if (online) await SyncService.syncQueue();
      });
    } catch {
      // NetInfo not available — assume online
      useAlertStore.getState().setIsOnline(true);
    }
  },

  stop(): void {
    unsubscribe?.();
    unsubscribe = null;
  },

  async syncQueue(): Promise<void> {
    const store = useAlertStore.getState();
    const queue = AlertQueue.getAll();
    if (queue.length === 0) return;

    store.setIsSyncing(true);
    for (const alert of queue) {
      try {
        await apiClient.post(Endpoints.alerts, alert);
        AlertQueue.remove(alert.id);
      } catch {
        // leave in queue for next sync attempt
      }
    }
    store.markSynced();
  },
};
