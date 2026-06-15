import type { Alert } from '../../types';
import { LocalStorage, StorageKeys } from './LocalStorage';

export const AlertQueue = {
  getAll(): Alert[] {
    return LocalStorage.get<Alert[]>(StorageKeys.ALERT_QUEUE) ?? [];
  },

  enqueue(alert: Alert): void {
    const queue = AlertQueue.getAll();
    LocalStorage.set(StorageKeys.ALERT_QUEUE, [...queue, alert]);
  },

  dequeue(): Alert | null {
    const queue = AlertQueue.getAll();
    if (queue.length === 0) return null;
    const [head, ...rest] = queue;
    LocalStorage.set(StorageKeys.ALERT_QUEUE, rest);
    return head;
  },

  remove(id: string): void {
    const queue = AlertQueue.getAll().filter((a) => a.id !== id);
    LocalStorage.set(StorageKeys.ALERT_QUEUE, queue);
  },

  clear(): void {
    LocalStorage.remove(StorageKeys.ALERT_QUEUE);
  },

  size(): number {
    return AlertQueue.getAll().length;
  },
};
