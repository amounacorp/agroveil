import { Link } from 'react-router-dom';
import { Bird, CheckCircle, Eye, BellRing, ArrowRight } from 'lucide-react';
import { FarmerLayout } from '../components/layout/FarmerLayout';
import { KPICard } from '../components/ui/KPICard';
import { SyncBadge } from '../components/ui/SyncBadge';
import { CameraCard } from '../components/ui/CameraCard';
import { AlertCard } from '../components/ui/AlertCard';
import { HealthGaugeChart } from '../components/charts/HealthGaugeChart';
import { ActivityLineChart } from '../components/charts/ActivityLineChart';
import { KPICardSkeleton } from '../components/ui/LoadingSkeleton';
import { useFarms, useFarmStats, useCameras, useWeeklyActivity } from '../hooks/useFarm';
import { useAlerts, useResolveAlert } from '../hooks/useAlerts';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store/uiStore';
import { getHealthColor } from '../utils/formatters';

export function Dashboard() {
  const { farmer } = useAuth();
  const { addToast } = useUIStore();

  const { data: farms } = useFarms();
  const farm = farms?.[0];

  const { data: stats, isLoading: statsLoading } = useFarmStats(farm?.id ?? '');
  const { data: cameras } = useCameras(farm?.id ?? '');
  const { data: activity } = useWeeklyActivity(farm?.id ?? '');
  const { data: alerts } = useAlerts(farm?.id ?? '');
  const resolveAlert = useResolveAlert();

  const recentAlerts = alerts?.slice(0, 3) ?? [];

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert.mutateAsync(id);
      addToast('Alerte marquée comme résolue ✓', 'success');
    } catch {
      addToast('Impossible de résoudre l\'alerte', 'error');
    }
  };

  return (
    <FarmerLayout title={farm ? `${farm.name} — Bâtiment A` : 'Tableau de bord'}>
      {/* Welcome banner */}
      <section className="mb-6 p-5 rounded-card bg-[#EAF3DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <Bird size={120} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1E6B2E]">
            Bonjour {farmer?.first_name ?? 'Fermier'} 👋
          </h2>
          <p className="text-sm text-[#555555] mt-0.5">Votre troupeau se porte bien aujourd'hui</p>
        </div>
        {stats && <SyncBadge lastSyncAt={stats.last_sync_at} />}
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : stats ? (
          <>
            <KPICard
              label="Oiseaux total"
              value={stats.total_birds}
              icon={<Bird size={20} className="text-[#1E6B2E]" />}
            />
            <KPICard
              label="En bonne santé"
              value={stats.healthy_count}
              color="#1E6B2E"
              borderColor="#1E6B2E"
              icon={<CheckCircle size={20} className="text-[#1E6B2E]" />}
            />
            <KPICard
              label="Sous surveillance"
              value={stats.monitored_count}
              color="#854F0B"
              bgColor="#FAEEDA"
              borderColor="#EF9F27"
              icon={<Eye size={20} className="text-[#854F0B]" />}
            />
            <KPICard
              label="Alertes aujourd'hui"
              value={stats.alerts_today}
              color="#A32D2D"
              bgColor="#FCEBEB"
              borderColor="#E24B4A"
              icon={<BellRing size={20} className="text-[#A32D2D]" />}
            />
          </>
        ) : null}
      </section>

      {/* Health + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* Health score */}
        <div className="lg:col-span-4 bg-white rounded-card shadow-card border border-[#E8E8E8] p-5">
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Score de santé global</h3>
          {stats ? (
            <>
              <HealthGaugeChart score={stats.health_score} label={stats.health_label} />
              <div className="text-center mt-3">
                <p className="text-lg font-bold" style={{ color: getHealthColor(stats.health_label) }}>
                  {stats.health_label}
                </p>
                <p className="text-xs text-[#888888] mt-0.5">Troupeau en bonne forme</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-3 py-1 rounded-pill">
                  Mortalité {stats.mortality_rate}%
                </span>
                <span className="text-xs bg-[#FAEEDA] text-[#854F0B] px-3 py-1 rounded-pill">
                  Stress {stats.stress_rate}%
                </span>
                <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-3 py-1 rounded-pill">
                  Activité {stats.activity_rate}%
                </span>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-[#E8E8E8] animate-pulse" />
            </div>
          )}
        </div>

        {/* Activity chart */}
        <div className="lg:col-span-8 bg-white rounded-card shadow-card border border-[#E8E8E8] p-5">
          <h3 className="font-semibold text-[#1A1A1A] mb-4">Activité du troupeau — 7 derniers jours</h3>
          {activity ? (
            <ActivityLineChart data={activity} />
          ) : (
            <div className="h-52 bg-[#F0F0F0] rounded-lg animate-pulse" />
          )}
        </div>
      </div>

      {/* Cameras */}
      {cameras && cameras.length > 0 && (
        <section className="mb-6">
          <h3 className="font-semibold text-[#1A1A1A] mb-3">Caméras en direct</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cameras.map((cam) => (
              <CameraCard key={cam.id} camera={cam} />
            ))}
          </div>
        </section>
      )}

      {/* Recent alerts */}
      <section className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1A1A1A]">Alertes récentes</h3>
          <Link to="/alertes" className="flex items-center gap-1 text-sm text-[#1E6B2E] font-medium hover:underline">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onResolve={handleResolve} compact />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#888888] text-center py-8">
            🎉 Aucune alerte récente — votre troupeau se porte bien !
          </p>
        )}
      </section>
    </FarmerLayout>
  );
}
