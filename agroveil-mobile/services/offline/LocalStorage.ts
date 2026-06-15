// Compatibility layer: MMKV in native builds, AsyncStorage in Expo Go
// This allows the app to run in Expo Go without a dev build

let mmkv: { getString: (k: string) => string | undefined; set: (k: string, v: string) => void; delete: (k: string) => void; clearAll: () => void } | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV({ id: 'agroveil-store' });
} catch {
  // MMKV not available (Expo Go) — fall through to AsyncStorage shim
}

// In-memory fallback for Expo Go (data is not persisted across app restarts)
const memoryStore: Record<string, string> = {};

export const storage = {
  getString: (key: string) => mmkv ? mmkv.getString(key) : memoryStore[key],
  set:       (key: string, value: string) => mmkv ? mmkv.set(key, value) : (memoryStore[key] = value),
  delete:    (key: string) => mmkv ? mmkv.delete(key) : delete memoryStore[key],
  clearAll:  () => mmkv ? mmkv.clearAll() : Object.keys(memoryStore).forEach((k) => delete memoryStore[k]),
};

export const LocalStorage = {
  get<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },

  set<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  remove(key: string): void {
    storage.delete(key);
  },

  clear(): void {
    storage.clearAll();
  },
};

export const StorageKeys = {
  AUTH_TOKEN:    'auth_token',
  AUTH_USER:     'auth_user',
  ALERT_QUEUE:   'alert_queue',
  FARM_STATS:    'farm_stats',
  LAST_SYNC:     'last_sync',
} as const;
