import { useQuery } from '@tanstack/react-query';
import { MOCK_MODE } from '../constants/api';
import { MOCK_CAMERAS } from '../mocks';
import { camerasApi } from '../services/api/cameras';
import type { CameraStatus } from '../types';

export function useCameras() {
  return useQuery<CameraStatus[]>({
    queryKey: ['cameras'],
    queryFn: async () => {
      if (MOCK_MODE) return MOCK_CAMERAS;
      const res = await camerasApi.getAll();
      return res.data;
    },
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}
