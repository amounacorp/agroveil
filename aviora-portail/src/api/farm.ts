import client from './client';
import { mockFarm, mockFarmStats, mockCameras, mockWeeklyActivity } from './mockData';
import { MOCK_MODE } from '../utils/constants';
import type { Farm, FarmStats, Camera, WeeklyActivity } from '../types';

export async function getFarms(): Promise<Farm[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return [mockFarm];
  }
  const { data } = await client.get<Farm[]>('/farmer/farms');
  return data;
}

export async function createFarm(farmerName: string, city: string): Promise<Farm> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    return { ...mockFarm, id: `farm-${Date.now()}`, name: `Ferme de ${farmerName}` };
  }
  const { data } = await client.post<Farm>('/farmer/farms', {
    name: `Ferme de ${farmerName}`,
    location: city || '',
  });
  return data;
}

export async function getFarmStats(_farmId: string): Promise<FarmStats> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    return mockFarmStats;
  }
  const { data } = await client.get<FarmStats>('/farmer/stats');
  return data;
}

export async function getCameras(_farmId: string): Promise<Camera[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockCameras;
  }
  const { data } = await client.get<Camera[]>('/farmer/cameras');
  return data;
}

export async function getWeeklyActivity(_farmId: string): Promise<WeeklyActivity[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockWeeklyActivity;
  }
  const { data } = await client.get<WeeklyActivity[]>('/farmer/weekly');
  return data;
}

export async function createCamera(
  _farmId: string,
  name: string,
  zone: string,
  maxAllowed: number,
  currentCount: number,
): Promise<Camera> {
  if (currentCount >= maxAllowed) {
    throw new Error(`LIMIT_REACHED:${maxAllowed}`);
  }
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const cam: Camera = {
      id: `cam-${Date.now()}`,
      farm_id: 'mock-farm',
      name,
      zone,
      status: 'offline',
      last_seen_at: new Date().toISOString(),
    };
    mockCameras.push(cam);
    return cam;
  }
  const { data } = await client.post<Camera>('/farmer/cameras', { name, zone });
  return data;
}
