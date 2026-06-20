import { Platform } from 'react-native';

export const StorageKeys = {
  AUTH_TOKEN:    'auth_token',
  AUTH_USER:     'auth_user',
  AI_PARAMS:     'ai_params',
  AI_CONFIG:     'ai_config',
  SYNC_PREFS:    'sync_prefs',
  NOTIF_PREFS:   'notif_prefs',
  NOTIF_SETTINGS: 'notif_settings',
  LAST_SYNC:     'last_sync',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

// Web: use window.localStorage; Native: use MMKV
let _mmkv: { set(k: string, v: string): void; getString(k: string): string | undefined; delete(k: string): void; clearAll(): void } | null = null;

function getNative() {
  if (_mmkv) return _mmkv;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  _mmkv = new MMKV({ id: 'aviora-storage' });
  return _mmkv!;
}

export const LocalStorage = {
  set<T>(key: StorageKey, value: T): void {
    const serialized = JSON.stringify(value);
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, serialized);
    } else {
      getNative().set(key, serialized);
    }
  },

  get<T>(key: StorageKey): T | null {
    let raw: string | null | undefined;
    if (Platform.OS === 'web') {
      raw = window.localStorage.getItem(key);
    } else {
      raw = getNative().getString(key);
    }
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  remove(key: StorageKey): void {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
    } else {
      getNative().delete(key);
    }
  },

  clear(): void {
    if (Platform.OS === 'web') {
      window.localStorage.clear();
    } else {
      getNative().clearAll();
    }
  },
};
