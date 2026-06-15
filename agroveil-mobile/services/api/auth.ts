import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { User } from '../../types';

export const authApi = {
  requestOtp: (phone: string) =>
    apiClient.post<{ message: string }>(Endpoints.login, { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post<{ user: User; token: string }>(Endpoints.verify, { phone, code }),
};
