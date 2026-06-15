import client from './client';
import { mockFarmer } from './mockData';
import { MOCK_MODE, TOKEN_KEY } from '../utils/constants';
import type { Farmer } from '../types';

export interface RegisterRequest {
  full_name: string;
  country: string;
  phone?: string;
  email?: string;
  password: string;
}

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

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    if (email !== 'demo@agroveil.com' || password !== 'demo1234') {
      throw new Error('Email ou mot de passe incorrect.');
    }
    const token = 'mock-jwt-token-farmer-email';
    localStorage.setItem(TOKEN_KEY, token);
    return { token, farmer: { ...mockFarmer, email } };
  }
  const { data } = await client.post<LoginResponse>('/auth/farmer/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    const token = 'mock-jwt-token-farmer-google';
    localStorage.setItem(TOKEN_KEY, token);
    return { token, farmer: { ...mockFarmer, email: 'google@demo.com' } };
  }
  const { data } = await client.post<LoginResponse>('/auth/google', { id_token: idToken });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}

export async function uploadMyPhoto(file: File): Promise<{ photo_url: string }> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    return { photo_url: '/uploads/farmer_mock.jpg' };
  }
  const form = new FormData();
  form.append('photo', file);
  const { data } = await client.post<{ photo_url: string }>('/auth/me/photo', form, {
    headers: { 'Content-Type': undefined },
    timeout: 30000,
  });
  return data;
}

export async function registerFarmer(req: RegisterRequest): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    const token = 'mock-jwt-token-farmer-new';
    localStorage.setItem(TOKEN_KEY, token);
    return {
      token,
      farmer: {
        ...mockFarmer,
        id: `farmer-new-${Date.now()}`,
        full_name: req.full_name,
        first_name: req.full_name.split(' ')[0],
        email: req.email,
        phone: req.phone || '',
        country: req.country,
        whatsapp_number: req.phone || '',
        created_at: new Date().toISOString(),
      },
    };
  }
  const { data } = await client.post<LoginResponse>('/auth/register', req);
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
