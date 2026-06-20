import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Bell, TrendingUp, Cpu, CheckCircle, Plus, Download } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import KPICard from '../components/ui/KPICard';
import AlertBadge from '../components/ui/AlertBadge';
import FarmerGrowthChart from '../components/charts/FarmerGrowthChart';
import PlanDonutChart from '../components/charts/PlanDonutChart';
import WhatsAppBtn from '../components/ui/WhatsAppBtn';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getDashboardStats, getFarmerGrowth, getPlanDistribution } from '../api/analytics';
import { getAlerts } from '../api/alerts';
import { formatRelativeDate, formatAlertType, formatCurrency } from '../utils/formatters';
import { useT } from '../hooks/useT';
import { useSettingsStore } from '../store/settingsStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const t = useT();
  const currency = useSettingsStore((s) => s.currency);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 30_000,
  });

  const { data: growth } = useQuery({
    queryKey: ['farmer-growth'],
    queryFn: getFarmerGrowth,
    staleTime: 60_000,
  });

  const { data: plans } = useQuery({
    queryKey: ['plan-distribution'],
    queryFn: getPlanDistribution,
    staleTime: 60_000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', { is_resolved: false }],
    queryFn: () => getAlerts({ is_resolved: false, limit: 5 }),
    staleTime: 15_000,
  });

  const alerts = alertsData?.data ?? [];

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t.dashboard.title}</h2>
          <p className="text-sm text-[#888888] mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/farmers')}
            className="flex items-center gap-2 px-4 py-2 border border-[#E8E8E8] bg-white text-sm font-medium text-[#555555] rounded-btn hover:bg-[#F8FAF8] transition-colors"
          >
            <Download size={16} /> {t.common.export}
          </button>
          <button
            onClick={() => navigate('/admin/farmers', { state: { openAdd: true } })}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors"
          >
            <Plus size={16} /> {t.dashboard.addFarmer}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" label={t.common.loading} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label={t.dashboard.activeFarmers}
            value={stats?.total_farmers.toString() ?? '—'}
            trend={`+${stats?.farmers_growth ?? 0} ce mois`}
            trendUp={true}
            icon={<Users size={20} className="text-[#1E6B2E]" />}
            iconBg="bg-[#EAF3DE]"
          />
          <KPICard
            label={t.dashboard.unresolvedAlerts}
            value={stats?.active_alerts.toString() ?? '—'}
            sub={`${stats?.critical_alerts ?? 0} ${t.severity.critical.toLowerCase()}`}
            icon={<Bell size={20} className="text-[#A32D2D]" />}
            iconBg="bg-[#FCEBEB]"
            valueColor="text-[#A32D2D]"
          />
          <KPICard
            label={t.dashboard.mrr}
            value={stats ? formatCurrency(stats.mrr_fcfa, currency) : '—'}
            trend={`+${stats?.mrr_growth ?? 0}%`}
            trendUp={true}
            icon={<TrendingUp size={20} className="text-[#1E6B2E]" />}
            iconBg="bg-[#EAF3DE]"
          />
          <KPICard
            label={t.dashboard.aiAccuracy}
            value={stats ? `${stats.ai_accuracy}%` : '—'}
            sub="Modèle v2.1"
            icon={<Cpu size={20} className="text-[#0C447C]" />}
            iconBg="bg-[#E6F1FB]"
            valueColor="text-[#0C447C]"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-bold text-[#1A1A1A]">{t.dashboard.farmerGrowth}</h4>
            <select className="text-xs border border-[#E8E8E8] rounded-lg px-2 py-1 text-[#555555] bg-white">
              <option>6 derniers mois</option>
            </select>
          </div>
          {growth ? <FarmerGrowthChart data={growth} /> : <div className="h-[220px] flex items-center justify-center"><LoadingSpinner /></div>}
        </div>
        <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
          <h4 className="font-bold text-[#1A1A1A] mb-5">{t.dashboard.planDistribution}</h4>
          {plans ? <PlanDonutChart data={plans} /> : <div className="h-[220px] flex items-center justify-center"><LoadingSpinner /></div>}
        </div>
      </div>

      {/* Alerts table */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <h4 className="font-bold text-[#1A1A1A]">{t.dashboard.recentAlerts}</h4>
          <Link to="/admin/alerts" className="text-[#1E6B2E] text-xs font-bold hover:underline">
            {t.common.viewAll} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
              <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                <th className="px-5 py-3">{t.alerts.farmer}</th>
                <th className="px-5 py-3">{t.alerts.type}</th>
                <th className="px-5 py-3">{t.alerts.severity}</th>
                <th className="px-5 py-3">{t.alerts.detectedAt}</th>
                <th className="px-5 py-3">{t.common.all}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-[#F8FAF8] cursor-pointer transition-colors"
                  onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                >
                  <td className="px-5 py-3.5 font-semibold text-sm text-[#1A1A1A]">{alert.farmer_name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#555555]">{formatAlertType(alert.alert_type)}</td>
                  <td className="px-5 py-3.5"><AlertBadge severity={alert.severity} /></td>
                  <td className="px-5 py-3.5 text-sm text-[#888888] italic">{formatRelativeDate(alert.created_at)}</td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs font-bold text-[#1E6B2E] hover:text-[#17521F] flex items-center gap-1 border border-[#1E6B2E] px-2 py-1 rounded-btn transition-colors hover:bg-[#EAF3DE]"
                        onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                      >
                        <CheckCircle size={12} /> {t.common.resolve}
                      </button>
                      <WhatsAppBtn label="" onClick={() => {}} />
                    </div>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#888888] text-sm">
                    {t.dashboard.noAlerts}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System status */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-[#555555]">Statut :</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#27500A] bg-[#EAF3DE] px-3 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 bg-[#1E6B2E] rounded-full" /> API
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#27500A] bg-[#EAF3DE] px-3 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 bg-[#1E6B2E] rounded-full" /> Database
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#854F0B] bg-[#FAEEDA] px-3 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 bg-[#EF9F27] rounded-full animate-pulse" /> WhatsApp API (latence)
        </span>
      </div>
    </AdminLayout>
  );
}
