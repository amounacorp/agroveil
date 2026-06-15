import { Linking } from 'react-native';
import { alertsApi } from '../api/alerts';
import type { Alert } from '../../types';

const SEVERITY_EMOJI: Record<Alert['severity'], string> = {
  critical: '🚨',
  warning:  '⚠️',
  info:     'ℹ️',
};

export const WhatsAppBridge = {
  async sendViaApi(alertId: string): Promise<boolean> {
    try {
      const res = await alertsApi.notifyWhatsApp(alertId);
      return res.data.sent;
    } catch {
      return false;
    }
  },

  sendViaDeepLink(alert: Alert, phoneNumber: string): void {
    const emoji = SEVERITY_EMOJI[alert.severity];
    const time = new Date(alert.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });
    const msg = encodeURIComponent(
      `${emoji} AgroVeil ALERTE ${alert.severity.toUpperCase()}\n` +
      `Ferme: ${alert.farmName}\n` +
      `Type: ${alert.type.replace(/_/g, ' ')}\n` +
      `Heure: ${time}\n` +
      `Confiance IA: ${Math.round(alert.confidence * 100)}%\n` +
      `→ ${alert.advice}`
    );
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${msg}`);
  },
};
