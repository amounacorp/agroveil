import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api/reports';
import type { MonthlyReport } from '../types';

export function useReports() {
  return useQuery<MonthlyReport[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportsApi.getAll();
      return res.data;
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
