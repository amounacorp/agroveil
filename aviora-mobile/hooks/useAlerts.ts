import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_MODE } from '../constants/api';
import { MOCK_ALERTS } from '../mocks';
import { alertsApi } from '../services/api/alerts';
import { useAlertStore } from '../store/alertStore';
import type { Alert, AlertSeverity } from '../types';

export function useAlerts(severityFilter?: AlertSeverity | 'all' | 'resolved') {
  const setAlerts = useAlertStore((s) => s.setAlerts);

  const query = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (MOCK_MODE) {
        setAlerts(MOCK_ALERTS);
        return MOCK_ALERTS;
      }
      const res = await alertsApi.getAll();
      setAlerts(res.data);
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const filtered = (query.data ?? []).filter((a) => {
    if (!severityFilter || severityFilter === 'all') return true;
    if (severityFilter === 'resolved') return a.isResolved;
    return a.severity === severityFilter && !a.isResolved;
  });

  return { ...query, data: filtered };
}

export function useAlertById(id: string) {
  return useQuery<Alert>({
    queryKey: ['alert', id],
    queryFn: async () => {
      if (MOCK_MODE) {
        const found = MOCK_ALERTS.find((a) => a.id === id);
        if (!found) throw new Error('Alert not found');
        return found;
      }
      const res = await alertsApi.getById(id);
      return res.data;
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  const resolveInStore = useAlertStore((s) => s.resolveAlert);

  return useMutation({
    mutationFn: async (id: string) => {
      resolveInStore(id);
      if (!MOCK_MODE) await alertsApi.resolve(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
