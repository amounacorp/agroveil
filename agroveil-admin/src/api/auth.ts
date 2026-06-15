import client from './client';
import type { AdminUser } from '../types';
import { AUTH_TOKEN_KEY, MOCK_MODE } from '../utils/constants';

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: AdminUser;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    if (payload.email === 'admin@agroveil.com' && payload.password === 'admin123') {
      const token = 'mock_jwt_token_admin';
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return {
        access_token: token,
        user: { id: '1', name: 'Admin Root', email: payload.email, role: 'admin', token },
      };
    }
    throw new Error('Email ou mot de passe incorrect');
  }

  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  if (!MOCK_MODE) {
    await client.post('/auth/logout').catch(() => undefined);
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function refreshToken(): Promise<string> {
  const { data } = await client.post<{ access_token: string }>('/auth/refresh');
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return data.access_token;
}
