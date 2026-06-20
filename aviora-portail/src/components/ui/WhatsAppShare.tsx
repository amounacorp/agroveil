import { MessageCircle } from 'lucide-react';
import type { MonthlyReport, Farm } from '../../types';
import { shareOnWhatsApp } from '../../utils/pdf';

interface WhatsAppShareProps {
  report: MonthlyReport;
  farm: Farm;
}

export function WhatsAppShare({ report, farm }: WhatsAppShareProps) {
  return (
    <button
      onClick={() => shareOnWhatsApp(report, farm)}
      className="h-10 px-4 rounded-btn text-sm font-semibold bg-[#25D366] text-white flex items-center gap-2 hover:bg-[#1DA851] transition-colors"
    >
      <MessageCircle size={16} />
      WhatsApp
    </button>
  );
}
