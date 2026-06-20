import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, Filter } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import AlertBadge from '../../components/ui/AlertBadge';
import FarmerAvatar from '../../components/ui/FarmerAvatar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import WhatsAppBtn from '../../components/ui/WhatsAppBtn';
import { getAlerts, resolveAlert, sendWhatsApp } from '../../api/alerts';
import { formatAlertType, formatRelativeDate } from '../../utils/formatters';
import { useUIStore } from '../../store/uiStore';
import { useT } from '../../hooks/useT';
import type { Alert } from '../../types';


export default function AlertsList() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const t = useT();

  const [severity, setSeverity] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', { severity, is_resolved: showResolved ? undefined : false }],
    queryFn: () =>
      getAlerts({
        severity: severity || undefined,
        is_resolved: showResolved ? undefined : false,
      }),
    staleTime: 15_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast(t.alerts.resolvedSuccess, 'success');
    },
    onError: () => addToast(t.alerts.resolvedError, 'error'),
  });

  const whatsappMutation = useMutation({
    mutationFn: (id: string) => sendWhatsApp(id),
    onSuccess: () => addToast(t.alerts.whatsappSuccess, 'success'),
    onError: () => addToast(t.alerts.whatsappError, 'error'),
  });

  const alerts: Alert[] = data?.data ?? [];

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t.alerts.title}</h2>
          <p className="text-sm text-[#888888] mt-0.5">
            {data?.total ?? '—'} · {t.alerts.subtitle}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card px-5 py-4 mb-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-[#888888]" />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="border border-[#E8E8E8] rounded-btn px-3 py-2 text-sm text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 bg-white"
        >
          <option value="">{t.alerts.allSeverities}</option>
          <option value="critical">{t.severity.critical}</option>
          <option value="warning">{t.severity.warning}</option>
          <option value="info">{t.severity.info}</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-[#555555] cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="accent-[#1E6B2E]"
          />
          {showResolved ? t.alerts.hideResolved : t.alerts.showResolved}
        </label>
      </div>

      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="Chargement des alertes..." />
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState
            title="Aucune alerte"
            description="Aucune alerte active pour le moment. Bonne surveillance !"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">{t.alerts.farmer}</th>
                  <th className="px-5 py-3">Farm</th>
                  <th className="px-5 py-3">{t.alerts.type}</th>
                  <th className="px-5 py-3">{t.alerts.severity}</th>
                  <th className="px-5 py-3">{t.alerts.detectedAt}</th>
                  <th className="px-5 py-3">{t.farmers.status}</th>
                  <th className="px-5 py-3 text-right">{t.common.resolve}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#F8FAF8] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FarmerAvatar name={alert.farmer_name} size="sm" />
                        <span className="font-semibold text-sm text-[#1A1A1A]">
                          {alert.farmer_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#555555]">{alert.farm_name}</td>
                    <td className="px-5 py-3.5 text-sm text-[#555555]">
                      {formatAlertType(alert.alert_type)}
                    </td>
                    <td className="px-5 py-3.5">
                      <AlertBadge severity={alert.severity} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#888888] italic">
                      {formatRelativeDate(alert.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      {alert.is_resolved ? (
                        <span className="text-xs text-[#27500A] bg-[#EAF3DE] px-2 py-0.5 rounded-pill font-bold">
                          Résolu ✓
                        </span>
                      ) : (
                        <span className="text-xs text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded-pill font-bold">
                          Ouvert
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/alerts/${alert.id}`)}
                          className="p-1.5 rounded-lg hover:bg-[#EAF3DE] text-[#1E6B2E] transition-colors"
                          title="Voir le détail"
                        >
                          <Eye size={16} />
                        </button>
                        {!alert.is_resolved && (
                          <button
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                            className="p-1.5 rounded-lg hover:bg-[#EAF3DE] text-[#1E6B2E] transition-colors disabled:opacity-50"
                            title="Marquer résolu"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <WhatsAppBtn
                          label=""
                          onClick={() => whatsappMutation.mutate(alert.id)}
                          loading={whatsappMutation.isPending}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
