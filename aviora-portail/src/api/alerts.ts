import client from './client';
import { mockAlerts } from './mockData';
import { MOCK_MODE } from '../utils/constants';
import type { Alert } from '../types';

export interface AlertFilters {
  severity?: string;
  alert_type?: string;
  is_resolved?: boolean;
  page?: number;
  per_page?: number;
}

export async function getAlerts(_farmId: string, filters?: AlertFilters): Promise<Alert[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    let alerts = [...mockAlerts];
    if (filters?.severity) alerts = alerts.filter((a) => a.severity === filters.severity);
    if (filters?.alert_type) alerts = alerts.filter((a) => a.alert_type === filters.alert_type);
    if (filters?.is_resolved !== undefined) alerts = alerts.filter((a) => a.is_resolved === filters.is_resolved);
    return alerts;
  }
  const { data } = await client.get<Alert[]>('/farmer/farm-alerts', { params: filters });
  return data;
}

export async function getAlert(alertId: string): Promise<Alert> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const alert = mockAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error('Alerte introuvable');
    return alert;
  }
  const { data } = await client.get<Alert>(`/alerts/${alertId}`);
  return data;
}

export async function resolveAlert(alertId: string): Promise<void> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 500));
    const alert = mockAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.is_resolved = true;
      alert.resolved_at = new Date().toISOString();
    }
    return;
  }
  await client.patch(`/alerts/${alertId}/resolve`);
}
