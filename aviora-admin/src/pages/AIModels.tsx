import { useQuery } from '@tanstack/react-query';
import { Brain, TrendingUp, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getAIMetrics } from '../api/analytics';

const MODEL_META: Record<string, { label: string; description: string; color: string; bg: string }> = {
  mortality:          { label: 'Mortalité',           description: 'Détecte les oiseaux immobiles ou morts',              color: '#A32D2D', bg: '#FCEBEB' },
  heat_stress:        { label: 'Stress thermique',    description: 'Identifie les comportements de surchauffe',            color: '#854F0B', bg: '#FAEEDA' },
  inactivity:         { label: 'Inactivité',          description: 'Détecte les zones d\'inactivité anormale',             color: '#185FA5', bg: '#E6F1FB' },
  cannibalism:        { label: 'Cannibalisme',        description: 'Repère les comportements de picage agressif',          color: '#6B21A8', bg: '#F3E8FF' },
  feeder_empty:       { label: 'Mangeoire vide',      description: 'Alerte quand les mangeoires ne sont plus accessibles', color: '#1E6B2E', bg: '#EAF3DE' },
  abnormal_movement:  { label: 'Mouvement anormal',   description: 'Détecte des déplacements inhabituels dans le troupeau', color: '#0F766E', bg: '#CCFBF1' },
};

function AccuracyBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 90 ? '#1E6B2E' : pct >= 80 ? '#854F0B' : '#A32D2D';
  return (
    <div className="w-full bg-[#F2F2F2] rounded-full h-2 overflow-hidden">
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function AccuracyBadge({ value }: { value: number }) {
  if (value >= 90) return <span className="flex items-center gap-1 text-[#1E6B2E] text-xs font-bold"><CheckCircle size={13} /> Excellent</span>;
  if (value >= 80) return <span className="flex items-center gap-1 text-[#854F0B] text-xs font-bold"><TrendingUp size={13} /> Bon</span>;
  return <span className="flex items-center gap-1 text-[#A32D2D] text-xs font-bold"><AlertTriangle size={13} /> À améliorer</span>;
}

export default function AIModels() {
  const { data: metrics = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ai-metrics'],
    queryFn: getAIMetrics,
    staleTime: 60_000,
  });

  const avg = metrics.length
    ? metrics.reduce((s, m) => s + m.accuracy, 0) / metrics.length
    : 0;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Modèles IA</h2>
          <p className="text-sm text-[#888888] mt-0.5">
            Performances des modèles de détection Aviora
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E8E8E8] text-sm text-[#555555] rounded-btn hover:bg-[#F8FAF8] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Chargement des métriques..." />
        </div>
      ) : (
        <>
          {/* KPI global */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1">Précision moyenne</p>
              <p className="text-3xl font-bold text-[#1E6B2E]">{avg.toFixed(1)}%</p>
              <AccuracyBar value={avg} />
            </div>
            <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1">Modèles actifs</p>
              <p className="text-3xl font-bold text-[#1A1A1A]">{metrics.length}</p>
              <p className="text-xs text-[#888888] mt-1">en production</p>
            </div>
            <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-1">Modèles ≥ 90%</p>
              <p className="text-3xl font-bold text-[#1A1A1A]">
                {metrics.filter((m) => m.accuracy >= 90).length}
                <span className="text-base font-normal text-[#888888]"> / {metrics.length}</span>
              </p>
              <p className="text-xs text-[#888888] mt-1">seuil d'excellence</p>
            </div>
          </div>

          {/* Tableau des modèles */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-[#E8E8E8]">
              <h3 className="font-bold text-[#1A1A1A]">Détail par modèle</h3>
            </div>
            <div className="divide-y divide-[#F2F2F2]">
              {metrics.map((m) => {
                const meta = MODEL_META[m.type] ?? { label: m.type, description: '', color: '#888888', bg: '#F2F2F2' };
                return (
                  <div key={m.type} className="px-5 py-4 flex items-center gap-4 hover:bg-[#F8FAF8] transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                      <Brain size={18} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{meta.label}</p>
                        <span className="text-sm font-bold" style={{ color: meta.color }}>{m.accuracy.toFixed(1)}%</span>
                      </div>
                      <AccuracyBar value={m.accuracy} />
                      <p className="text-[11px] text-[#888888] mt-1.5">{meta.description}</p>
                    </div>
                    <div className="flex-shrink-0 w-28 text-right">
                      <AccuracyBadge value={m.accuracy} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info sur l'entraînement */}
          <div className="bg-[#EAF3DE] border border-[#C5E0B4] rounded-card p-5">
            <div className="flex items-start gap-3">
              <Brain size={20} className="text-[#1E6B2E] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#1E6B2E] mb-1">À propos des modèles</p>
                <p className="text-sm text-[#27500A]">
                  Les modèles Aviora sont entraînés sur des données vidéo de volailles d'Afrique Centrale et de l'Ouest.
                  Les métriques sont recalculées à chaque cycle d'évaluation hebdomadaire sur un jeu de test indépendant.
                  Une précision ≥ 90% est requise pour le déploiement en production.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
