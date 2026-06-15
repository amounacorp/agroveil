import axios from 'axios';
import { API_URL } from '../../constants/api';
import { LocalStorage, StorageKeys } from '../offline/LocalStorage';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = LocalStorage.get<string>(StorageKeys.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      LocalStorage.remove(StorageKeys.AUTH_TOKEN);
      LocalStorage.remove(StorageKeys.AUTH_USER);
    }
    return Promise.reject(error);
  }
);
