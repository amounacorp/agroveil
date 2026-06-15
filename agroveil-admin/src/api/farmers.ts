import client from './client';
import type { Farmer } from '../types';
import { MOCK_MODE } from '../utils/constants';
import { mockFarmers } from './mockData';

interface FarmersFilter {
  country?: string;
  plan?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedFarmers {
  data: Farmer[];
  total: number;
  page: number;
  limit: number;
}

export async function getFarmers(filters: FarmersFilter = {}): Promise<PaginatedFarmers> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    let data = [...mockFarmers];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (f) =>
          f.full_name.toLowerCase().includes(q) ||
          f.phone.includes(q) ||
          f.city.toLowerCase().includes(q),
      );
    }
    if (filters.country) data = data.filter((f) => f.country === filters.country);
    if (filters.plan)
      data = data.filter((f) => f.subscription?.plan === filters.plan);
    return { data, total: data.length, page: 1, limit: 20 };
  }

  const { data } = await client.get<PaginatedFarmers>('/farmers', { params: filters });
  return data;
}

export async function getFarmer(id: string): Promise<Farmer> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const farmer = mockFarmers.find((f) => f.id === id);
    if (!farmer) throw new Error('Agriculteur introuvable');
    return farmer;
  }
  const { data } = await client.get<Farmer>(`/farmers/${id}`);
  return data;
}

export async function createFarmer(payload: Partial<Farmer>): Promise<Farmer> {
  const { data } = await client.post<Farmer>('/farmers', payload);
  return data;
}

export async function updateFarmer(id: string, payload: Partial<Farmer>): Promise<Farmer> {
  const { data } = await client.put<Farmer>(`/farmers/${id}`, payload);
  return data;
}

export async function suspendFarmer(id: string): Promise<void> {
  await client.post(`/farmers/${id}/suspend`);
}

export async function deleteFarmer(id: string): Promise<void> {
  await client.delete(`/farmers/${id}`);
}
