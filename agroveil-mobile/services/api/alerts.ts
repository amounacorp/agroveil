import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { Alert } from '../../types';

export const alertsApi = {
  getAll: () =>
    apiClient.get<Alert[]>(Endpoints.alerts),

  getById: (id: string) =>
    apiClient.get<Alert>(Endpoints.alertById(id)),

  resolve: (id: string) =>
    apiClient.post<Alert>(Endpoints.resolveAlert(id)),

  notifyWhatsApp: (id: string) =>
    apiClient.post<{ sent: boolean }>(Endpoints.notifyWhatsApp(id)),
};
