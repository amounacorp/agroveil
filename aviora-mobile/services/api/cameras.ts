import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { CameraStatus } from '../../types';

export const camerasApi = {
  getAll() { return apiClient.get<CameraStatus[]>(Endpoints.cameras); },
  heartbeat(cameraId: string) {
    return apiClient.post<void>(`${Endpoints.cameras}/${cameraId}/heartbeat`);
  },
  uploadSnapshot(cameraId: string, base64Jpeg: string) {
    return apiClient.post<{ snapshot_url: string }>(
      `${Endpoints.cameras}/${cameraId}/snapshot`,
      { image: base64Jpeg },
    );
  },
};
