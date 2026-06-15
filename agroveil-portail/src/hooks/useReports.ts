import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, generateReport } from '../api/reports';

export function useReports(farmId: string) {
  return useQuery({
    queryKey: ['reports', farmId],
    queryFn: () => getReports(farmId),
    staleTime: 5 * 60_000,
    enabled: !!farmId,
  });
}

export function useGenerateReport(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => generateReport(farmId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports', farmId] });
    },
  });
}
