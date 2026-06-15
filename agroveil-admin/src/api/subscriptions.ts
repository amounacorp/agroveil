import client from './client';
import type { Subscription, Payment, PlanConfig } from '../types';
import { MOCK_MODE } from '../utils/constants';
import { mockFarmers } from './mockData';

interface SubscriptionListResponse {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return mockFarmers
      .map((f) => f.subscription)
      .filter((s): s is Subscription => s !== undefined);
  }
  const { data } = await client.get<SubscriptionListResponse>('/subscriptions?limit=100');
  return data.data ?? data as unknown as Subscription[];
}

export async function getPlans(): Promise<PlanConfig[]> {
  if (MOCK_MODE) {
    return [
      { id: 1, slug: 'free', name: 'GRATUIT', price_fcfa: 0, max_cameras: 1, history_days: 7, addon_price_fcfa: null, features: ['1 caméra', 'SMS'], is_cooperative: false, sort_order: 1 },
      { id: 2, slug: 'eleveur', name: 'ÉLEVEUR', price_fcfa: 5000, max_cameras: 3, history_days: 90, addon_price_fcfa: 1500, features: ['3 caméras', 'WhatsApp'], is_cooperative: false, sort_order: 2 },
      { id: 3, slug: 'pro', name: 'PRO', price_fcfa: 15000, max_cameras: 10, history_days: 365, addon_price_fcfa: 1000, features: ['10 caméras', 'API'], is_cooperative: false, sort_order: 3 },
      { id: 4, slug: 'cooperative', name: 'COOPÉRATIVE', price_fcfa: 0, max_cameras: -1, history_days: -1, addon_price_fcfa: null, features: ['Illimité'], is_cooperative: true, sort_order: 4 },
    ];
  }
  const { data } = await client.get<PlanConfig[]>('/subscriptions/plans');
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
