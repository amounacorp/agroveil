import client from './client';
import { mockFarm, mockFarmStats, mockCameras, mockWeeklyActivity } from './mockData';
import { MOCK_MODE } from '../utils/constants';
import type { Farm, FarmStats, Camera, WeeklyActivity } from '../types';

export async function getFarms(): Promise<Farm[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return [mockFarm];
  }
  const { data } = await client.get<Farm[]>('/farms');
  return data;
}

export async function getFarmStats(farmId: string): Promise<FarmStats> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    return mockFarmStats;
  }
  const { data } = await client.get<FarmStats>(`/farms/${farmId}/stats`);
  return data;
}

export async function getCameras(farmId: string): Promise<Camera[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockCameras;
  }
  const { data } = await client.get<Camera[]>(`/farms/${farmId}/cameras`);
  return data;
}

export async function getWeeklyActivity(farmId: string): Promise<WeeklyActivity[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockWeeklyActivity;
  }
  const { data } = await client.get<WeeklyActivity[]>(`/farms/${farmId}/activity/weekly`);
  return data;
}
