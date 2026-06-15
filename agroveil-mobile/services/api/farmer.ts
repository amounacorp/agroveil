import { apiClient } from './client';
import type { User } from '../../types';

export interface ProfileUpdateRequest {
  full_name?: string;
  city?: string;
  whatsapp_number?: string;
  language?: string;
}

export const farmerApi = {
  getMe: () => apiClient.get<User>('/farmer/me'),
  updateMe: (data: ProfileUpdateRequest) => apiClient.patch<User>('/farmer/me', data),
};
