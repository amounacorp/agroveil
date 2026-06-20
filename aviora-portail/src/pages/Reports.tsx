import { Plus } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { ReportCard } from '../components/ui/ReportCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ReportCardSkeleton } from '../components/ui/LoadingSkeleton';
import { useReports, useGenerateReport } from '../hooks/useReports';
import { useAlerts } from '../hooks/useAlerts';
import { useUIStore } from '../store/uiStore';
import { generateReportPDF } from '../utils/pdf';
import { formatTrend, formatPercent } from '../utils/formatters';
import { useFarms } from '../hooks/useFarm';

function getScoreStyle(score: number) {
  if (score >= 90) return { color: '#27500A', backgroundColor: '#EAF3DE' };
  if (score >= 85) return { color: '#854F0B', backgroundColor: '#FAEEDA' };
  return { color: '#A32D2D', backgroundColor: '#FCEBEB' };
}

export function Reports() {
  const { addToast } = useUIStore();
  const { data: farms } = useFarms();
  const farm = farms?.[0];
  const farmId = farm?.id ?? '';

  const { data: reports, isLoading } = useReports(farmId);
  const { data: alerts } = useAlerts(farmId);
  const generateReport = useGenerateReport(farmId);

  const handleDownload = async (report: typeof reports extends (infer R)[] | undefined ? R : never) => {
    if (!farm) return;
    try {
      await generateReportPDF(report as Parameters<typeof generateReportPDF>[0], farm, alerts ?? []);
      addToast('PDF téléchargé avec succès ✓', 'success');
    } catch {
      addToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  const handleGenerate = async () => {
    try {
      await generateReport.mutateAsync();
      addToast('Rapport généré avec succès ✓', 'success');
    } catch {
      addToast('Impossible de générer le rapport', 'error');
    }
  };

  return (
    <FarmerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes Rapports</h1>
          <p className="text-sm text-[#888888] mt-0.5">Analysez les performances mensuelles.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generateReport.isPending || !farmId}
          className="h-11 px-5 bg-[#1E6B2E] text-white rounded-btn text-sm font-semibold flex items-center gap-2 hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
        >
          <Plus size={16} />
          {generateReport.isPending ? 'Génération...' : 'Générer un rapport'}
        </button>
      </div>

      {/* Report cards grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ReportCardSkeleton key={i} />)
        ) : !reports || reports.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon="📊"
              title="Aucun rapport disponible"
              description="Générez votre premier rapport mensuel pour analyser les performances de votre troupeau."
              action={{ label: 'Générer un rapport', onClick: handleGenerate }}
            />
          </div>
        ) : (
          reports.map((report, i) => (
            <ReportCard
              key={report.id}
              report={report}
              farm={farm!}
              onDownload={handleDownload}
              isFirst={i === 0}
            />
          ))
        )}
      </section>

      {/* Zootechnical summary table */}
      {reports && reports.length > 0 && (
        <section className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden">
          <div className="p-5 border-b border-[#E8E8E8]">
            <h3 className="font-semibold text-[#1A1A1A]">Bilan zootechnique — 4 derniers mois</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAF8] text-[#888888] text-xs uppercase">
                  <th className="text-left px-5 py-3 font-medium">Mois</th>
                  <th className="text-right px-5 py-3 font-medium">Effectif moyen</th>
                  <th className="text-right px-5 py-3 font-medium">Mortalité</th>
                  <th className="text-right px-5 py-3 font-medium">Alertes</th>
                  <th className="text-right px-5 py-3 font-medium">Score</th>
                  <th className="text-right px-5 py-3 font-medium">Tendance</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAF8]'}>
                    <td className="px-5 py-3 font-medium text-[#1A1A1A]">{r.month_label}</td>
                    <td className="px-5 py-3 text-right text-[#555555]">{r.avg_bird_count}</td>
                    <td className="px-5 py-3 text-right text-[#555555]">{formatPercent(r.mortality_rate)}</td>
                    <td className="px-5 py-3 text-right text-[#555555]">{r.alert_count}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-pill text-xs font-semibold" style={getScoreStyle(r.health_score_avg)}>
                        {r.health_score_avg}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className="font-semibold"
                        style={{ color: r.trend === 'up' ? '#27500A' : r.trend === 'down' ? '#A32D2D' : '#854F0B' }}
                      >
                        {formatTrend(r.trend)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </FarmerLayout>
  );
}
