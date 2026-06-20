import axios from 'axios';
import { API_URL, AUTH_TOKEN_KEY } from '../utils/constants';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = '/aviora/admin/login';
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Une erreur est survenue';
    return Promise.reject(new Error(message));
  },
);

export default client;
