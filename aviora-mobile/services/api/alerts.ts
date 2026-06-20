import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { Alert } from '../../types';

export interface CreateAlertPayload {
  type: Alert['type'];
  severity: Alert['severity'];
  confidence: number;
  description: string;
  camera_id?: string;
  farm_name?: string;
}

export const alertsApi = {
  getAll() { return apiClient.get<Alert[]>(Endpoints.alerts); },
  getById(id: string) { return apiClient.get<Alert>(Endpoints.alertById(id)); },
  create(payload: CreateAlertPayload) { return apiClient.post<Alert>(Endpoints.alerts, payload); },
  resolve(id: string) { return apiClient.post<void>(Endpoints.resolveAlert(id)); },
  notifyWhatsApp(id: string) { return apiClient.post<void>(Endpoints.notifyWhatsApp(id)); },
};
