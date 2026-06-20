export const API_URL  = process.env.EXPO_PUBLIC_API_URL ?? 'https://cortex-agents.com/aviora/api';
export const WS_URL   = process.env.EXPO_PUBLIC_WS_URL  ?? 'wss://cortex-agents.com/aviora/ws';
export const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

export const Endpoints = {
  login:           '/auth/otp/request',
  verify:          '/auth/otp/verify',
  farmerLogin:     '/auth/farmer/login',
  register:        '/auth/register',
  googleLogin:     '/auth/google',
  farmStats:       '/farmer/stats',
  alerts:          '/farmer/alerts',
  alertById:       (id: string) => `/farmer/alerts/${id}`,
  resolveAlert:    (id: string) => `/farmer/alerts/${id}/resolve`,
  notifyWhatsApp:  (id: string) => `/farmer/alerts/${id}/whatsapp`,
  cameras:         '/farmer/cameras',
  weeklyActivity:  '/farmer/weekly',
  reports:         '/farmer/reports',
} as const;
