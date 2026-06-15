import { useMutation } from '@tanstack/react-query';
import { WhatsAppBridge } from '../services/notifications/WhatsAppBridge';
import { useAlertStore } from '../store/alertStore';
import type { Alert } from '../types';

export function useWhatsApp() {
  const isOnline = useAlertStore((s) => s.isOnline);

  const sendMutation = useMutation({
    mutationFn: async ({ alert, phone }: { alert: Alert; phone?: string }) => {
      if (isOnline) {
        const sent = await WhatsAppBridge.sendViaApi(alert.id);
        if (sent) return;
      }
      WhatsAppBridge.sendViaDeepLink(alert, phone ?? '');
    },
  });

  return {
    sendAlert: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
}
