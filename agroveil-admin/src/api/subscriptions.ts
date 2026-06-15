import client from './client';
import type { Subscription, Payment } from '../types';
import { MOCK_MODE } from '../utils/constants';
import { mockFarmers } from './mockData';

export async function getSubscriptions(): Promise<Subscription[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return mockFarmers
      .map((f) => f.subscription)
      .filter((s): s is Subscription => s !== undefined);
  }
  const { data } = await client.get<Subscription[]>('/subscriptions');
  return data;
}

export async function updateSubscription(
  id: string,
  payload: Partial<Subscription>,
): Promise<Subscription> {
  const { data } = await client.put<Subscription>(`/subscriptions/${id}`, payload);
  return data;
}

export async function getPayments(): Promise<Payment[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return [
      {
        id: 'PAY-001',
        farmer_id: 'FRM-7001',
        amount_fcfa: 15000,
        method: 'mtn_momo',
        status: 'completed',
        paid_at: '2026-01-10T10:00:00Z',
        created_at: '2026-01-10T09:55:00Z',
      },
      {
        id: 'PAY-002',
        farmer_id: 'FRM-7003',
        amount_fcfa: 35000,
        method: 'orange_money',
        status: 'completed',
        paid_at: '2025-11-20T12:00:00Z',
        created_at: '2025-11-20T11:55:00Z',
      },
    ];
  }
  const { data } = await client.get<Payment[]>('/payments');
  return data;
}
