import { Linking } from 'react-native';
import { apiClient } from '../api/client';
import { Endpoints } from '../../constants/api';
import type { Alert } from '../../types';

function buildMessage(alert: Alert): string {
  const lines = [
    `🚨 *Alerte Aviora — ${alert.farmName}*`,
    ``,
    `*Type :* ${alert.type}`,
    `*Sévérité :* ${alert.severity}`,
    `*Caméra :* ${alert.cameraName}`,
    ``,
    alert.description,
    ``,
    `*Conseil :* ${alert.advice}`,
  ];
  return encodeURIComponent(lines.join('\n'));
}

export const WhatsAppBridge = {
  async sendViaApi(alertId: string): Promise<boolean> {
    try {
      await apiClient.post<void>(Endpoints.notifyWhatsApp(alertId));
      return true;
    } catch {
      return false;
    }
  },

  sendViaDeepLink(alert: Alert, phone: string): void {
    const number = phone.replace(/[^0-9]/g, '');
    const msg = buildMessage(alert);
    const url = number
      ? `https://wa.me/${number}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    Linking.openURL(url).catch(() => {});
  },
};
