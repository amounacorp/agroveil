import client from './client';
import { mockSubscription, mockPayments } from './mockData';
import { MOCK_MODE } from '../utils/constants';
import type { Subscription, Payment } from '../types';

export async function getSubscription(farmerId: string): Promise<Subscription> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockSubscription;
  }
  const { data } = await client.get<Subscription>(`/farmers/${farmerId}/subscription`);
  return data;
}

export async function getPayments(farmerId: string): Promise<Payment[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockPayments;
  }
  const { data } = await client.get<Payment[]>(`/farmers/${farmerId}/payments`);
  return data;
}

export async function upgradePlan(
  farmerId: string,
  plan: 'eleveur' | 'pro',
  method: string
): Promise<void> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1000));
    return;
  }
  await client.post(`/farmers/${farmerId}/subscription/upgrade`, { plan, method });
}
