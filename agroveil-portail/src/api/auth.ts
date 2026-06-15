import client from './client';
import { mockFarmer } from './mockData';
import { MOCK_MODE, TOKEN_KEY } from '../utils/constants';
import type { Farmer } from '../types';

export interface LoginResponse {
  token: string;
  farmer: Farmer;
}

export async function requestOTP(phone: string): Promise<void> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    return;
  }
  await client.post('/auth/otp/request', { phone });
}

export async function verifyOTP(phone: string, code: string): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1000));
    if (code !== '123456') throw new Error('Code incorrect. Vérifiez et réessayez.');
    const token = 'mock-jwt-token-farmer-001';
    localStorage.setItem(TOKEN_KEY, token);
    return { token, farmer: mockFarmer };
  }
  const { data } = await client.post<LoginResponse>('/auth/otp/verify', { phone, code });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function logout(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  if (!MOCK_MODE) {
    await client.post('/auth/logout').catch(() => {});
  }
}

export async function getMe(): Promise<Farmer> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockFarmer;
  }
  const { data } = await client.get<Farmer>('/auth/me');
  return data;
}
