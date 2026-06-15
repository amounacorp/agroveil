import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { CameraStatus } from '../../types';

export const camerasApi = {
  getAll: () => apiClient.get<CameraStatus[]>(Endpoints.cameras),
};
