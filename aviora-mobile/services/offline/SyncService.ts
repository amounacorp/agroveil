import NetInfo from '@react-native-community/netinfo';
import { alertsApi } from '../api/alerts';
import { useAlertStore } from '../../store/alertStore';

let _unsubscribe: (() => void) | null = null;
let _syncInterval: ReturnType<typeof setInterval> | null = null;
let _isFlushing = false;

async function flushQueue(): Promise<void> {
  if (_isFlushing) return;
  const store = useAlertStore.getState();
  if (store.offlineQueue.length === 0) return;

  _isFlushing = true;
  try {
    while (useAlertStore.getState().offlineQueue.length > 0) {
      const alert = store.dequeueOffline();
      if (!alert) break;
      await alertsApi.create({
        type:        alert.type,
        severity:    alert.severity,
        confidence:  alert.confidence,
        description: alert.description,
        farm_name:   alert.farmName,
      });
    }
  } catch {
    // Leave remaining items in queue for next sync attempt
  } finally {
    _isFlushing = false;
  }
}

export const SyncService = {
  start(intervalMs = 60_000): void {
    if (_unsubscribe) return;

    // Flush as soon as we come back online
    _unsubscribe = NetInfo.addEventListener((state) => {
      useAlertStore.getState().setOnline(!!state.isConnected);
      if (state.isConnected) flushQueue();
    });

    // Periodic flush as backup
    _syncInterval = setInterval(async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) flushQueue();
    }, intervalMs);
  },

  stop(): void {
    _unsubscribe?.();
    _unsubscribe = null;
    if (_syncInterval) {
      clearInterval(_syncInterval);
      _syncInterval = null;
    }
  },

  flush: flushQueue,
};
