import type { AlertType } from '../types';

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  mortality: 'Mortalité détectée',
  heat_stress: 'Stress thermique',
  inactivity: 'Inactivité anormale',
  cannibalism: 'Cannibalisme détecté',
  feeder_empty: 'Mangeoire vide',
  abnormal_movement: 'Mouvement anormal',
};

export const PLAN_LABELS: Record<string, string> = {
  free: 'GRATUIT',
  eleveur: 'ÉLEVEUR',
  pro: 'PRO',
  cooperative: 'COOPÉRATIVE',
};

export const PLAN_COLORS: Record<string, { text: string; bg: string }> = {
  free: { text: '#888888', bg: '#F2F2F2' },
  eleveur: { text: '#27500A', bg: '#EAF3DE' },
  pro: { text: '#633806', bg: '#FAEEDA' },
  cooperative: { text: '#0C447C', bg: '#E6F1FB' },
};

export const MOBILE_MONEY_BRANDS: Record<string, { label: string; bg: string; text: string }> = {
  mtn_momo: { label: 'MTN MoMo', bg: '#FFCC00', text: '#1A1A1A' },
  orange_money: { label: 'Orange Money', bg: '#FF6600', text: '#FFFFFF' },
  airtel_money: { label: 'Airtel Money', bg: '#E40000', text: '#FFFFFF' },
  stripe: { label: 'Carte bancaire', bg: '#6772E5', text: '#FFFFFF' },
};

export const COUNTRY_CODES = [
  { code: '+242', flag: '🇨🇬', name: 'Congo', iso: 'CG' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo', iso: 'CD' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", iso: 'CI' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', iso: 'SN' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun', iso: 'CM' },
  { code: '+223', flag: '🇲🇱', name: 'Mali', iso: 'ML' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', iso: 'BF' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', iso: 'BJ' },
];

export const TOKEN_KEY = 'agroveil_farmer_token';
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';
export const API_URL = import.meta.env.VITE_API_URL as string;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
