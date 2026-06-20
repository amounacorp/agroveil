export const API_URL = import.meta.env.VITE_API_URL as string;
export const WS_URL = import.meta.env.VITE_WS_URL as string;
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export const AUTH_TOKEN_KEY = 'Aviora_admin_token';

export const PLAN_COLORS: Record<string, { text: string; bg: string }> = {
  free: { text: '#888888', bg: '#F2F2F2' },
  eleveur: { text: '#27500A', bg: '#EAF3DE' },
  pro: { text: '#633806', bg: '#FAEEDA' },
  cooperative: { text: '#0C447C', bg: '#E6F1FB' },
};

export const SEVERITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: '#A32D2D', bg: '#FCEBEB', border: '#E24B4A' },
  warning: { text: '#854F0B', bg: '#FAEEDA', border: '#EF9F27' },
  info: { text: '#0C447C', bg: '#E6F1FB', border: '#378ADD' },
};

export const CHART_COLORS = {
  mortality: '#A32D2D',
  heat_stress: '#EF9F27',
  inactivity: '#185FA5',
  cannibalism: '#7C3AED',
  primary: '#1E6B2E',
  amber: '#EF9F27',
  gray: '#888888',
};

export const COUNTRIES = [
  { code: 'CG', label: '🇨🇬 Congo' },
  { code: 'CM', label: '🇨🇲 Cameroun' },
  { code: 'SN', label: '🇸🇳 Sénégal' },
  { code: 'CI', label: "🇨🇮 Côte d'Ivoire" },
  { code: 'GA', label: '🇬🇦 Gabon' },
];
