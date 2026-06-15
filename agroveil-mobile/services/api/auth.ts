import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { User } from '../../types';

export interface LoginResponse {
  token: string;
  farmer: User;
}

export interface RegisterRequest {
  full_name: string;
  country: string;
  phone?: string;
  email?: string;
  password: string;
}

export const authApi = {
  requestOtp: (phone: string) =>
    apiClient.post<{ message: string }>(Endpoints.login, { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post<LoginResponse>(Endpoints.verify, { phone, code }),

  loginWithEmail: (email: string, password: string) =>
    apiClient.post<LoginResponse>(Endpoints.farmerLogin, { email, password }),

  register: (req: RegisterRequest) =>
    apiClient.post<LoginResponse>(Endpoints.register, req),

  loginWithGoogle: (idToken: string) =>
    apiClient.post<LoginResponse>(Endpoints.googleLogin, { id_token: idToken }),
};
