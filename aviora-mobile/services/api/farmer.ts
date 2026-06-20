import axios from 'axios';
import { API_URL } from '../../constants/api';
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

export const farmerApi = {
  getMe() {
    return client.get<User>('/farmer/me');
  },

  updateMe(payload: { full_name?: string; city?: string; whatsapp_number?: string }) {
    return client.patch<User>('/farmer/me', payload);
  },

  uploadPhoto(file: { uri: string; name: string; type: string }) {
    const form = new FormData();
    form.append('photo', file as unknown as Blob);
    return client.post<{ photo_url: string }>('/farmer/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
