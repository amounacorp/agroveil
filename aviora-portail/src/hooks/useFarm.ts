import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFarms, getFarmStats, getCameras, getWeeklyActivity, createCamera, createFarm } from '../api/farm';
import { getSubscription } from '../api/subscription';

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

export function useSubscription(farmerId: string) {
  return useQuery({
    queryKey: ['subscription', farmerId],
    queryFn: () => getSubscription(farmerId),
    staleTime: 5 * 60_000,
    enabled: !!farmerId,
  });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmerName, city }: { farmerName: string; city: string }) =>
      createFarm(farmerName, city),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['farms'] });
    },
  });
}

export function useCreateCamera() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ farmId, name, zone, maxAllowed, currentCount }: {
      farmId: string;
      name: string;
      zone: string;
      maxAllowed: number;
      currentCount: number;
    }) => createCamera(farmId, name, zone, maxAllowed, currentCount),
    onSuccess: (_, { farmId }) => {
      qc.invalidateQueries({ queryKey: ['cameras', farmId] });
    },
  });
}
