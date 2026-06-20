import { Download } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { formatTrend } from '../../utils/formatters';
import { shareOnWhatsApp } from '../../utils/pdf';
import type { MonthlyReport, Farm } from '../../types';

interface ReportCardProps {
  report: MonthlyReport;
  farm: Farm;
  onDownload: (report: MonthlyReport) => void;
  isFirst?: boolean;
}

export function ReportCard({ report, farm, onDownload, isFirst = false }: ReportCardProps) {
  const trendColor = report.trend === 'up' ? '#27500A' : report.trend === 'down' ? '#A32D2D' : '#854F0B';
  const trendLabel =
    report.trend === 'up' ? 'Meilleur que le mois dernier' :
    report.trend === 'down' ? 'En baisse ce mois-ci' :
    'Stable ce mois-ci';

  const headerBg = isFirst ? '#1E6B2E' : '#2D7A3E';

  return (
    <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden">
      <div className="px-5 py-4 text-white" style={{ background: `linear-gradient(135deg, ${headerBg}, #2D7A3E)` }}>
        <p className="text-lg font-bold">{report.month_label}</p>
        <p className="text-xs opacity-80">Rapport mensuel</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 bg-[#FCEBEB] rounded-lg">
            <p className="text-xs text-[#888888] uppercase mb-1">Mortalité</p>
            <p className="text-xl font-bold text-[#A32D2D]">{report.mortality_rate}%</p>
          </div>
          <div className="text-center p-2 bg-[#FAEEDA] rounded-lg">
            <p className="text-xs text-[#888888] uppercase mb-1">Alertes</p>
            <p className="text-xl font-bold text-[#854F0B]">{report.alert_count}</p>
          </div>
          <div className="text-center p-2 bg-[#EAF3DE] rounded-lg">
            <p className="text-xs text-[#888888] uppercase mb-1">Score</p>
            <p className="text-xl font-bold text-[#1E6B2E]">{report.health_score_avg}%</p>
          </div>
        </div>
        <p className="text-xs font-medium mb-4" style={{ color: trendColor }}>
          {formatTrend(report.trend)} {trendLabel}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onDownload(report)}
            className="flex-1 h-10 border border-[#1E6B2E] text-[#1E6B2E] rounded-btn text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#EAF3DE] transition-colors"
          >
            <Download size={14} /> Télécharger PDF
          </button>
          <button
            onClick={() => shareOnWhatsApp(report, farm)}
            className="h-10 px-3 bg-[#25D366] text-white rounded-btn flex items-center gap-1 hover:bg-[#1DA851] transition-colors"
          >
            <MessageCircle size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
