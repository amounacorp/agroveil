import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, getAlert, resolveAlert } from '../api/alerts';
import type { AlertFilters } from '../api/alerts';

export function useAlerts(farmId: string, filters?: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', farmId, filters],
    queryFn: () => getAlerts(farmId, filters),
    staleTime: 30_000,
    refetchInterval: 2 * 60_000,
    enabled: !!farmId,
  });
}

export function useAlert(alertId: string) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: () => getAlert(alertId),
    enabled: !!alertId,
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['alert'] });
    },
  });
}
