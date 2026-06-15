import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { FarmerLayout } from '../../components/layout/FarmerLayout';
import { AlertCard } from '../../components/ui/AlertCard';
import { FilterPill } from '../../components/ui/FilterPill';
import { EmptyState } from '../../components/ui/EmptyState';
import { AlertCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { useAlerts, useResolveAlert } from '../../hooks/useAlerts';
import { useUIStore } from '../../store/uiStore';
import { mockFarm } from '../../api/mockData';
import type { AlertType } from '../../types';

const PERIOD_FILTERS = ['Cette semaine', 'Ce mois', 'Personnalisé'];
const TYPE_FILTERS: { label: string; value: AlertType | 'all' | 'resolved' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Mortalité', value: 'mortality' },
  { label: 'Stress', value: 'heat_stress' },
  { label: 'Inactivité', value: 'inactivity' },
  { label: 'Mangeoire', value: 'feeder_empty' },
  { label: 'Résolus', value: 'resolved' },
];

export function AlertsList() {
  const { addToast } = useUIStore();
  const [period, setPeriod] = useState('Ce mois');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: alerts, isLoading } = useAlerts(mockFarm.id);
  const resolveAlert = useResolveAlert();

  const filtered = (alerts ?? []).filter((a) => {
    if (typeFilter === 'resolved') return a.is_resolved;
    if (typeFilter === 'all') return true;
    return a.alert_type === typeFilter;
  });

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert.mutateAsync(id);
      addToast('Alerte marquée comme résolue ✓', 'success');
    } catch {
      addToast('Impossible de résoudre l\'alerte', 'error');
    }
  };

  return (
    <FarmerLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes Alertes</h1>
          <p className="text-sm text-[#888888] mt-0.5">Historique complet des détections par IA.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 bg-[#1E6B2E] text-white rounded-btn text-sm font-semibold flex items-center gap-2 hover:bg-[#0F3D1A] transition-colors">
            <Download size={15} /> Exporter PDF
          </button>
          <button className="h-10 px-4 border border-[#E8E8E8] text-[#555555] rounded-btn text-sm font-semibold flex items-center gap-2 hover:bg-[#F8FAF8] transition-colors">
            <FileText size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-4 mb-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIOD_FILTERS.map((p) => (
            <FilterPill key={p} label={p} active={period === p} onClick={() => setPeriod(p)} />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TYPE_FILTERS.map(({ label, value }) => (
            <FilterPill key={value} label={label} active={typeFilter === value} onClick={() => setTypeFilter(value)} />
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <AlertCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Aucune alerte trouvée"
            description="Aucune alerte ne correspond à ce filtre. Votre troupeau se porte bien !"
          />
        ) : (
          filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onResolve={handleResolve} />
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button className="h-10 px-4 border border-[#E8E8E8] rounded-btn text-sm text-[#555555] hover:bg-[#F8FAF8]">
            ← Précédent
          </button>
          <button className="w-10 h-10 bg-[#1E6B2E] text-white rounded-full text-sm font-bold">1</button>
          <button className="h-10 px-4 border border-[#E8E8E8] rounded-btn text-sm text-[#555555] hover:bg-[#F8FAF8]">
            Suivant →
          </button>
        </div>
      )}
    </FarmerLayout>
  );
}
