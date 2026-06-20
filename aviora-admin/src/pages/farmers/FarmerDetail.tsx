import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Phone, MapPin, Camera, Plus } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import FarmerAvatar from '../../components/ui/FarmerAvatar';
import PlanBadge from '../../components/ui/PlanBadge';
import StatusDot from '../../components/ui/StatusDot';
import AlertBadge from '../../components/ui/AlertBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import WhatsAppBtn from '../../components/ui/WhatsAppBtn';
import { getFarmer, initFarmerFarm } from '../../api/farmers';
import { getAlerts } from '../../api/alerts';
import { formatCountry, formatDate, formatAlertType, formatRelativeDate } from '../../utils/formatters';

export default function FarmerDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: farmer, isLoading } = useQuery({
    queryKey: ['farmer', id],
    queryFn: () => getFarmer(id!),
    enabled: !!id,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', { farmer_id: id }],
    queryFn: () => getAlerts({ farmer_id: id }),
    enabled: !!id,
  });

  const initFarm = useMutation({
    mutationFn: () => initFarmerFarm(id!, farmer!.full_name, farmer!.city ?? ''),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farmer', id] }),
  });

  const alerts = alertsData?.data ?? [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Chargement du profil..." />
        </div>
      </AdminLayout>
    );
  }

  if (!farmer) return null;

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#888888] mb-6">
        <Link to="/admin" className="hover:text-[#1E6B2E]">Tableau de bord</Link>
        <ChevronRight size={14} />
        <Link to="/admin/farmers" className="hover:text-[#1E6B2E]">Éleveurs</Link>
        <ChevronRight size={14} />
        <span className="text-[#1A1A1A] font-semibold">{farmer.full_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: farmer info */}
        <div className="flex flex-col gap-5">
          {/* Profile card */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 border-l-4 border-l-[#1E6B2E]">
            <div className="flex items-start gap-4 mb-5">
              <FarmerAvatar name={farmer.full_name} photoUrl={farmer.photo_url} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">{farmer.full_name}</h2>
                <p className="text-xs text-[#888888] mt-0.5">
                  Membre depuis {formatDate(farmer.created_at).split(' à')[0]}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {farmer.subscription && <PlanBadge plan={farmer.subscription.plan} />}
                  <StatusDot active={farmer.is_active} />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#E8E8E8] pt-4">
              <div className="flex items-center gap-2 text-sm text-[#555555]">
                <Phone size={14} className="text-[#888888] flex-shrink-0" />
                {farmer.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#555555]">
                <MapPin size={14} className="text-[#888888] flex-shrink-0" />
                {farmer.city}, {formatCountry(farmer.country)}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#555555]">
                <Camera size={14} className="text-[#888888] flex-shrink-0" />
                {farmer.cameras_count ?? 1} caméra(s)
              </div>
            </div>

            {(farmer.farms_count ?? 0) === 0 && (
              <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#FAEEDA] border border-[#EF9F27]/30 mb-3">
                  <span className="text-xs text-[#854F0B]">Aucune ferme configurée pour cet éleveur.</span>
                </div>
                <button
                  type="button"
                  onClick={() => initFarm.mutate()}
                  disabled={initFarm.isPending}
                  className="w-full h-9 flex items-center justify-center gap-2 bg-[#1E6B2E] text-white text-sm font-semibold rounded-btn hover:bg-[#0F3D1A] disabled:opacity-60 transition-colors"
                >
                  <Plus size={14} />
                  {initFarm.isPending ? 'Initialisation…' : 'Initialiser la ferme'}
                </button>
                {initFarm.isError && (
                  <p className="text-xs text-[#A32D2D] mt-2">
                    {initFarm.error instanceof Error ? initFarm.error.message : 'Erreur'}
                  </p>
                )}
                {initFarm.isSuccess && (
                  <p className="text-xs text-[#27500A] mt-2">Ferme créée ✓</p>
                )}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
              <WhatsAppBtn
                onClick={() => {}}
                label={`WhatsApp ${farmer.full_name.split(' ')[0]}`}
              />
            </div>
          </div>

          {/* Subscription card */}
          {farmer.subscription && (
            <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
              <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-4">
                Abonnement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#888888] uppercase font-bold mb-1">Plan</p>
                  <PlanBadge plan={farmer.subscription.plan} />
                </div>
                <div>
                  <p className="text-[10px] text-[#888888] uppercase font-bold mb-1">Statut</p>
                  <StatusDot
                    active={farmer.subscription.status === 'active'}
                    label={farmer.subscription.status}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-[#888888] uppercase font-bold mb-1">Expiration</p>
                  <p className="text-sm text-[#1A1A1A]">
                    {formatDate(farmer.subscription.expires_at).split(' à')[0]}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#888888] uppercase font-bold mb-1">Caméras max</p>
                  <p className="text-sm font-bold text-[#1A1A1A]">{farmer.subscription.max_cameras}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: alerts list */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8E8E8]">
              <h3 className="font-bold text-[#1A1A1A]">
                Historique des alertes
                <span className="ml-2 text-xs font-normal text-[#888888]">({alerts.length} total)</span>
              </h3>
            </div>
            {alerts.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#888888]">Aucune alerte pour cet éleveur</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                    <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Gravité</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F2F2]">
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-[#F8FAF8] transition-colors">
                        <td className="px-5 py-3.5 text-sm text-[#555555]">
                          {formatAlertType(alert.alert_type)}
                        </td>
                        <td className="px-5 py-3.5">
                          <AlertBadge severity={alert.severity} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#888888]">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
