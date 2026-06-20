import type { Alert } from '../../types';
import { useAlertStore } from '../../store/alertStore';

export const AlertQueue = {
  enqueue(alert: Alert): void {
    useAlertStore.getState().enqueueOffline(alert);
  },

  dequeue(): Alert | undefined {
    return useAlertStore.getState().dequeueOffline();
  },

  clear(): void {
    useAlertStore.getState().clearOfflineQueue();
  },

  get size(): number {
    return useAlertStore.getState().offlineQueue.length;
  },
};
