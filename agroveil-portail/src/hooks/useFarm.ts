import { useQuery } from '@tanstack/react-query';
import { getFarms, getFarmStats, getCameras, getWeeklyActivity } from '../api/farm';

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: getFarms,
    staleTime: 60_000,
  });
}

export function useFarmStats(farmId: string) {
  return useQuery({
    queryKey: ['farm-stats', farmId],
    queryFn: () => getFarmStats(farmId),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
    enabled: !!farmId,
  });
}

export function useCameras(farmId: string) {
  return useQuery({
    queryKey: ['cameras', farmId],
    queryFn: () => getCameras(farmId),
    staleTime: 30_000,
    enabled: !!farmId,
  });
}

export function useWeeklyActivity(farmId: string) {
  return useQuery({
    queryKey: ['weekly-activity', farmId],
    queryFn: () => getWeeklyActivity(farmId),
    staleTime: 60_000,
    enabled: !!farmId,
  });
}
