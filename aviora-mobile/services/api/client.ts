import axios from 'axios';
import { API_URL } from '../../constants/api';
import { LocalStorage, StorageKeys } from '../offline/LocalStorage';

export const apiClient = axios.create({ baseURL: API_URL, timeout: 15_000 });

apiClient.interceptors.request.use((config) => {
  const token = LocalStorage.get<string>(StorageKeys.AUTH_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const detail = err.response?.data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(', ')
      : (detail ?? err.response?.data?.message ?? 'Erreur réseau. Réessayez.');
    return Promise.reject(new Error(msg));
  },
);
