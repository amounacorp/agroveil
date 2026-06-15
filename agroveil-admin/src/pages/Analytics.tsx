import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import AlertTypeBarChart from '../components/charts/AlertTypeBarChart';
import AIAccuracyGauge from '../components/charts/AIAccuracyGauge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAlertDistribution, getAIMetrics } from '../api/analytics';
import { formatFCFA } from '../utils/formatters';

const DATE_RANGES = ['7 jours', '30 jours', '90 jours', 'Personnalisé'];

const TOP_FARMERS = [
  { name: 'Mbemba Jean', alerts: 14, pct: 85, color: '#A32D2D' },
  { name: 'Okoko Pierre', alerts: 9, pct: 55, color: '#EF9F27' },
  { name: 'Loubaki Marie', alerts: 7, pct: 42, color: '#EF9F27' },
  { name: 'Biyela Thomas', alerts: 4, pct: 25, color: '#1E6B2E' },
  { name: 'Ossila Grace', alerts: 2, pct: 12, color: '#1E6B2E' },
];

export default function Analytics() {
  const [range, setRange] = useState('30 jours');

  const { data: alertDist, isLoading: distLoading } = useQuery({
    queryKey: ['alert-distribution'],
    queryFn: getAlertDistribution,
    staleTime: 60_000,
  });

  const { data: aiMetrics, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-metrics'],
    queryFn: getAIMetrics,
    staleTime: 60_000,
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Analytiques</h2>
          <p className="text-sm text-[#888888] mt-0.5">
            Rapport consolidé des performances du réseau AgroVeil.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E8E8E8] rounded-btn px-3 py-2 shadow-sm">
          <Calendar size={16} className="text-[#1E6B2E]" />
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-btn text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-[#1E6B2E] text-white'
                  : 'text-[#555555] hover:bg-[#F8FAF8]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Alertes ce mois', value: '89', trend: '+12%', trendUp: false, color: 'text-[#A32D2D]', bg: 'bg-[#FCEBEB]' },
          { label: 'Temps moyen résolution', value: '4,2 min', trend: '−0,8m', trendUp: true, color: 'text-[#0C447C]', bg: 'bg-[#E6F1FB]' },
          { label: 'Pertes évitées estimées', value: formatFCFA(2_300_000), trend: '+450k', trendUp: true, color: 'text-[#1E6B2E]', bg: 'bg-[#EAF3DE]' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <p className="text-xs text-[#888888] font-semibold uppercase tracking-wide mb-2">{card.label}</p>
            <div className="flex items-end gap-2">
              <span className={`text-2xl font-bold ${card.color}`}>{card.value}</span>
              <span className={`text-xs font-bold mb-0.5 ${card.trendUp ? 'text-[#27500A]' : 'text-[#A32D2D]'}`}>
                {card.trendUp ? '↑' : '↓'} {card.trend}
              </span>
            </div>
            <div className="mt-3 h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
              <div className={`h-full ${card.bg.replace('bg-', 'bg-')} rounded-full`} style={{ width: `${[70, 85, 60][i]}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 mb-5">
        <h3 className="font-bold text-[#1A1A1A] mb-5">
          Distribution des alertes par type — 4 dernières semaines
        </h3>
        {distLoading ? (
          <div className="h-[260px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <AlertTypeBarChart data={alertDist ?? []} />
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top farmers */}
        <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
          <h3 className="font-bold text-[#1A1A1A] mb-5">Top 5 Éleveurs — Alertes</h3>
          <div className="space-y-4">
            {TOP_FARMERS.map((f, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[#1A1A1A] flex items-center gap-2">
                    <span className="text-[#888888] font-bold w-4">{i + 1}.</span>
                    {f.name}
                  </span>
                  <span className="text-[#888888]">{f.alerts} alertes</span>
                </div>
                <div className="w-full h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${f.pct}%`, background: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI performance */}
        <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
          <h3 className="font-bold text-[#1A1A1A] mb-5">Performance Modèle IA</h3>
          {aiLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <AIAccuracyGauge value={87.3} />
                <p className="text-center text-xs font-semibold text-[#555555] mt-2">Précision globale</p>
              </div>
              <div className="flex-1 w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] text-[#888888] uppercase font-bold border-b border-[#E8E8E8]">
                      <th className="text-left pb-2">Type</th>
                      <th className="text-right pb-2">Précision</th>
                      <th className="text-right pb-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F2F2]">
                    {(aiMetrics ?? []).map((m, i) => (
                      <tr key={i}>
                        <td className="py-2 text-[#555555]">{m.type}</td>
                        <td className="py-2 text-right font-bold text-[#1A1A1A]">
                          {m.accuracy.toFixed(1)}%
                        </td>
                        <td className="py-2 text-right">
                          {m.accuracy >= 85 ? '🟢' : m.accuracy >= 75 ? '🟡' : '🔴'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
