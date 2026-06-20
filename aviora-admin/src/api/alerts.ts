import client from './client';
import type { Alert } from '../types';
import { MOCK_MODE } from '../utils/constants';
import { mockAlerts } from './mockData';

interface AlertsFilter {
  severity?: string;
  is_resolved?: boolean;
  farmer_id?: string;
  page?: number;
  limit?: number;
}

interface PaginatedAlerts {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
}

export async function getAlerts(filters: AlertsFilter = {}): Promise<PaginatedAlerts> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    let data = [...mockAlerts];
    if (filters.severity) data = data.filter((a) => a.severity === filters.severity);
    if (filters.is_resolved !== undefined)
      data = data.filter((a) => a.is_resolved === filters.is_resolved);
    if (filters.farmer_id) data = data.filter((a) => a.farmer_id === filters.farmer_id);
    return { data, total: data.length, page: 1, limit: 20 };
  }

  const { data } = await client.get<PaginatedAlerts>('/alerts', { params: filters });
  return data;
}

export async function getAlert(id: string): Promise<Alert> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const alert = mockAlerts.find((a) => a.id === id);
    if (!alert) throw new Error('Alerte introuvable');
    return alert;
  }
  const { data } = await client.get<Alert>(`/alerts/${id}`);
  return data;
}

export async function resolveAlert(id: string): Promise<Alert> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const alert = mockAlerts.find((a) => a.id === id);
    if (!alert) throw new Error('Alerte introuvable');
    return { ...alert, is_resolved: true, resolved_at: new Date().toISOString() };
  }
  const { data } = await client.post<Alert>(`/alerts/${id}/resolve`);
  return data;
}

export async function sendWhatsApp(alertId: string): Promise<void> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await client.post(`/alerts/${alertId}/whatsapp`);
}
