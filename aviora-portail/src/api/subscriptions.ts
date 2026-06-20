import client from './client';
import type { Subscription, PlanConfig } from '../types';
import { MOCK_MODE } from '../utils/constants';
import { mockSubscription } from './mockData';

export async function getMySubscription(): Promise<Subscription> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return mockSubscription;
  }
  const { data } = await client.get<Subscription>('/subscriptions/my');
  return data;
}

export async function getPlans(): Promise<PlanConfig[]> {
  if (MOCK_MODE) {
    return [
      { id: 1, slug: 'free', name: 'GRATUIT', price_fcfa: 0, max_cameras: 1, history_days: 7, addon_price_fcfa: null, features: ['1 caméra maximum', 'Alertes SMS', 'Historique 7 jours', 'Dashboard de base', 'Support email'], is_cooperative: false, sort_order: 1 },
      { id: 2, slug: 'eleveur', name: 'ÉLEVEUR', price_fcfa: 5000, max_cameras: 3, history_days: 90, addon_price_fcfa: 1500, features: ['3 caméras incluses', 'Alertes WhatsApp illimitées', 'Historique 90 jours', 'Rapports PDF automatiques', 'Support prioritaire'], is_cooperative: false, sort_order: 2 },
      { id: 3, slug: 'pro', name: 'PRO', price_fcfa: 15000, max_cameras: 10, history_days: 365, addon_price_fcfa: 1000, features: ['10 caméras incluses', 'Alertes WhatsApp illimitées', 'Historique 365 jours', 'Multi-bâtiments', 'API publique', 'Rapports PDF avancés', 'Support 24/7'], is_cooperative: false, sort_order: 3 },
      { id: 4, slug: 'cooperative', name: 'COOPÉRATIVE', price_fcfa: 0, max_cameras: -1, history_days: -1, addon_price_fcfa: null, features: ['Caméras illimitées', 'Historique illimité', 'Dashboard centralisé', 'Gestion multi-sites', 'API complète dédiée', 'Support dédié', 'Formation incluse'], is_cooperative: true, sort_order: 4 },
    ];
  }
  const { data } = await client.get<PlanConfig[]>('/subscriptions/plans');
  return data;
}

export interface UpgradeRequest {
  plan: string;
  addon_cameras: number;
  payment_method: string;
}

export interface UpgradeResponse {
  status: 'payment_required' | 'quote_requested';
  plan: string;
  plan_name: string;
  total_cameras?: number;
  addon_cameras?: number;
  addon_cost_fcfa?: number;
  total_price_fcfa?: number;
  payment_method?: string;
  message: string;
}

export async function requestUpgrade(req: UpgradeRequest): Promise<UpgradeResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1000));
    if (req.plan === 'cooperative') {
      return { status: 'quote_requested', plan: 'cooperative', plan_name: 'COOPÉRATIVE', message: 'Votre demande de devis a été reçue. Notre équipe vous contactera sous 24h.' };
    }
    const prices: Record<string, number> = { free: 0, eleveur: 5000, pro: 15000 };
    const cameras: Record<string, number> = { free: 1, eleveur: 3, pro: 10 };
    const addonPrices: Record<string, number> = { eleveur: 1500, pro: 1000 };
    const base = prices[req.plan] ?? 0;
    const addonCost = (addonPrices[req.plan] ?? 0) * req.addon_cameras;
    return {
      status: 'payment_required',
      plan: req.plan,
      plan_name: req.plan.toUpperCase(),
      total_cameras: (cameras[req.plan] ?? 1) + req.addon_cameras,
      addon_cameras: req.addon_cameras,
      addon_cost_fcfa: addonCost,
      total_price_fcfa: base + addonCost,
      payment_method: req.payment_method,
      message: `Paiement de ${(base + addonCost).toLocaleString('fr')} FCFA via ${req.payment_method.replace(/_/g, ' ').toUpperCase()}.`,
    };
  }
  const { data } = await client.post<UpgradeResponse>('/subscriptions/upgrade', req);
  return data;
}
