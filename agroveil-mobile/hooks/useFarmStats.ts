import { useQuery } from '@tanstack/react-query';
import { MOCK_MODE } from '../constants/api';
import { MOCK_STATS, MOCK_WEEKLY } from '../mocks';
import { farmsApi } from '../services/api/farms';
import type { FarmStats, WeeklyActivity } from '../types';

export function useFarmStats() {
  return useQuery<FarmStats>({
    queryKey: ['farm-stats'],
    queryFn: async () => {
      if (MOCK_MODE) return MOCK_STATS;
      const res = await farmsApi.getStats();
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useWeeklyActivity() {
  return useQuery<WeeklyActivity[]>({
    queryKey: ['weekly-activity'],
    queryFn: async () => {
      if (MOCK_MODE) return MOCK_WEEKLY;
      const res = await farmsApi.getWeeklyActivity();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}
