import axios from 'axios';
import { API_URL, Endpoints } from '../../constants/api';
import { LocalStorage, StorageKeys } from '../offline/LocalStorage';
import type { User } from '../../types';

const client = axios.create({ baseURL: API_URL, timeout: 15_000 });

client.interceptors.request.use((config) => {
  const token = LocalStorage.get<string>(StorageKeys.AUTH_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const detail = err.response?.data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(', ')
      : (detail ?? err.response?.data?.message ?? 'Erreur réseau. Réessayez.');
    return Promise.reject(new Error(msg));
  },
);

export interface AuthResponse {
  token: string;
  farmer: User;
}

export const authApi = {
  requestOtp(phone: string) {
    return client.post<void>(Endpoints.login, { phone });
  },

  verifyOtp(phone: string, code: string) {
    return client.post<AuthResponse>(Endpoints.verify, { phone, code });
  },

  loginWithEmail(email: string, password: string) {
    return client.post<AuthResponse>(Endpoints.farmerLogin, { email, password });
  },

  loginWithGoogle(idToken: string) {
    return client.post<AuthResponse>(Endpoints.googleLogin, { id_token: idToken });
  },

  register(payload: {
    full_name: string;
    country: string;
    password: string;
    phone?: string;
    email?: string;
  }) {
    return client.post<AuthResponse>(Endpoints.register, payload);
  },
};
