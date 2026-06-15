import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Eye, Edit2, Ban } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import FarmerAvatar from '../../components/ui/FarmerAvatar';
import PlanBadge from '../../components/ui/PlanBadge';
import StatusDot from '../../components/ui/StatusDot';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { getFarmers, suspendFarmer } from '../../api/farmers';
import { formatCountry, formatRelativeDate } from '../../utils/formatters';
import { useUIStore } from '../../store/uiStore';
import type { Farmer } from '../../types';

const COUNTRIES = [
  { code: '', label: 'Tous les pays' },
  { code: 'CG', label: '🇨🇬 Congo' },
  { code: 'CM', label: '🇨🇲 Cameroun' },
  { code: 'SN', label: '🇸🇳 Sénégal' },
  { code: 'CI', label: "🇨🇮 Côte d'Ivoire" },
];

const PLANS = [
  { value: '', label: 'Tous les plans' },
  { value: 'free', label: 'FREE' },
  { value: 'eleveur', label: 'ÉLEVEUR' },
  { value: 'pro', label: 'PRO' },
  { value: 'cooperative', label: 'COOP' },
];

export default function FarmersList() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [plan, setPlan] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<Farmer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['farmers', { search, country, plan }],
    queryFn: () => getFarmers({ search: search || undefined, country: country || undefined, plan: plan || undefined }),
    staleTime: 30_000,
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendFarmer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      addToast('Éleveur suspendu avec succès', 'success');
      setSuspendTarget(null);
    },
    onError: () => addToast('Erreur lors de la suspension', 'error'),
  });

  const farmers = data?.data ?? [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Éleveurs</h2>
          <p className="text-sm text-[#888888] mt-0.5">
            {data?.total ?? '—'} au total · Gérez et surveillez votre réseau
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors">
          <Plus size={16} /> Ajouter un éleveur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card px-5 py-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8E8E8] rounded-btn focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border border-[#E8E8E8] rounded-btn px-3 py-2 text-sm text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 bg-white"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="border border-[#E8E8E8] rounded-btn px-3 py-2 text-sm text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 bg-white"
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-sm text-[#555555] rounded-btn hover:bg-[#F8FAF8] transition-colors">
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="Chargement des éleveurs..." />
          </div>
        ) : farmers.length === 0 ? (
          <EmptyState
            title="Aucun éleveur trouvé"
            description="Modifiez vos filtres ou ajoutez un nouvel éleveur."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAF8] border-b border-[#E8E8E8]">
                <tr className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
                  <th className="px-5 py-3">Éleveur</th>
                  <th className="px-5 py-3">Pays</th>
                  <th className="px-5 py-3">Fermes</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Caméras</th>
                  <th className="px-5 py-3">Dernière alerte</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {farmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-[#F8FAF8] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <FarmerAvatar name={farmer.full_name} />
                        <div>
                          <p className="font-semibold text-sm text-[#1A1A1A]">{farmer.full_name}</p>
                          <p className="text-[11px] text-[#888888]">{farmer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#555555]">
                      {formatCountry(farmer.country)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#555555]">
                      {farmer.farms_count ?? 1} ferme{(farmer.farms_count ?? 1) > 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5">
                      {farmer.subscription && (
                        <PlanBadge plan={farmer.subscription.plan} />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#1E6B2E]">
                      {farmer.cameras_count ?? 1} 📷
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#888888] italic">
                      {farmer.last_alert_at
                        ? formatRelativeDate(farmer.last_alert_at)
                        : 'Jamais'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusDot active={farmer.is_active} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/admin/farmers/${farmer.id}`)}
                          className="p-1.5 rounded-lg hover:bg-[#EAF3DE] text-[#1E6B2E] transition-colors"
                          title="Voir le profil"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-[#F8FAF8] text-[#888888] transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setSuspendTarget(farmer)}
                          className="p-1.5 rounded-lg hover:bg-[#FCEBEB] text-[#888888] hover:text-[#A32D2D] transition-colors"
                          title="Suspendre"
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {farmers.length > 0 && (
          <div className="px-5 py-3 border-t border-[#E8E8E8] flex items-center justify-between text-xs text-[#888888]">
            <span>Affichage 1–{farmers.length} sur {data?.total ?? farmers.length}</span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 rounded border border-[#E8E8E8] hover:bg-[#F8FAF8]">←</button>
              <button className="px-2.5 py-1 rounded bg-[#1E6B2E] text-white font-bold">1</button>
              <button className="px-2.5 py-1 rounded border border-[#E8E8E8] hover:bg-[#F8FAF8]">→</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={suspendTarget !== null}
        onClose={() => setSuspendTarget(null)}
        onConfirm={() => suspendTarget && suspendMutation.mutate(suspendTarget.id)}
        title="Suspendre l'éleveur"
        message={`Êtes-vous sûr de vouloir suspendre ${suspendTarget?.full_name} ? Son accès sera immédiatement bloqué.`}
        confirmLabel="Suspendre"
        danger
        loading={suspendMutation.isPending}
      />
    </AdminLayout>
  );
}
