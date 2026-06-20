import { useEffect } from 'react';
import { SyncService } from '../services/offline/SyncService';

export function useOfflineSync() {
  useEffect(() => {
    SyncService.start();
    return () => SyncService.stop();
  }, []);
}
