import axios from 'axios';
import { TOKEN_KEY, API_URL } from '../utils/constants';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/agroveil/portail/#/login';
    }
    const message =
      error.response?.data?.message ??
      'Connexion perdue. Réessayez dans un instant.';
    return Promise.reject(new Error(message));
  }
);

export default client;
