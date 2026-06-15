export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://35.224.208.173/agroveil/api';
export const WS_URL  = process.env.EXPO_PUBLIC_WS_URL  ?? 'ws://35.224.208.173/agroveil/ws';
export const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_MODE === 'true';

export const Endpoints = {
  login:           '/auth/otp/request',
  verify:          '/auth/otp/verify',
  farmStats:       '/farms/stats',
  alerts:          '/alerts',
  alertById:       (id: string) => `/alerts/${id}`,
  resolveAlert:    (id: string) => `/alerts/${id}/resolve`,
  notifyWhatsApp:  (id: string) => `/alerts/${id}/notify-whatsapp`,
  cameras:         '/cameras',
  weeklyActivity:  '/analytics/weekly',
} as const;
