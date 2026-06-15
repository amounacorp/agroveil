import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Download, Eye, Edit2, Ban, Camera } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import FarmerAvatar from '../../components/ui/FarmerAvatar';
import PlanBadge from '../../components/ui/PlanBadge';
import StatusDot from '../../components/ui/StatusDot';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { getFarmers, suspendFarmer, createFarmer, updateFarmer, uploadFarmerPhoto } from '../../api/farmers';
import { formatCountry, formatRelativeDate } from '../../utils/formatters';
import { useUIStore } from '../../store/uiStore';
import type { Farmer } from '../../types';

const COUNTRIES = [
  { code: '', label: 'Tous les pays' },
  { code: 'CG', label: '🇨🇬 Congo' },
  { code: 'CM', label: '🇨🇲 Cameroun' },
  { code: 'SN', label: '🇸🇳 Sénégal' },
  { code: 'CI', label: "🇨🇮 Côte d'Ivoire" },
  { code: 'GA', label: '🇬🇦 Gabon' },
];

const COUNTRIES_FORM = COUNTRIES.filter((c) => c.code !== '');

const PLANS = [
  { value: '', label: 'Tous les plans' },
  { value: 'free', label: 'FREE' },
  { value: 'eleveur', label: 'ÉLEVEUR' },
  { value: 'pro', label: 'PRO' },
  { value: 'cooperative', label: 'COOP' },
];

const EMPTY_FORM = { full_name: '', phone: '', country: 'CG', city: '', whatsapp_number: '', email: '', password: '' };

function exportCSV(farmers: Farmer[]) {
  const header = ['ID', 'Nom', 'Téléphone', 'Pays', 'Ville', 'WhatsApp', 'Plan', 'Statut', 'Fermes', 'Caméras', 'Inscription'];
  const rows = farmers.map((f) => [
    f.id,
    f.full_name,
    f.phone,
    f.country,
    f.city ?? '',
    f.whatsapp_number ?? '',
    f.subscription?.plan ?? '',
    f.is_active ? 'Actif' : 'Suspendu',
    f.farms_count ?? 0,
    f.cameras_count ?? 0,
    new Date(f.created_at).toLocaleDateString('fr-FR'),
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agroveil-eleveurs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FarmersList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [plan, setPlan] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<Farmer | null>(null);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      setAddForm(EMPTY_FORM);
      setAddErrors({});
      setShowAdd(true);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Farmer | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoUpload(farmerId: string, file: File) {
    setPhotoUploading(true);
    try {
      const { photo_url } = await uploadFarmerPhoto(farmerId, file);
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      setEditTarget((t) => t ? { ...t, photo_url } : t);
      addToast('Photo mise à jour', 'success');
    } catch {
      addToast('Erreur lors du téléchargement', 'error');
    } finally {
      setPhotoUploading(false);
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['farmers', { search, country, plan }],
    queryFn: () => getFarmers({ search: search || undefined, country: country || undefined, plan: plan || undefined }),
    staleTime: 30_000,
  });

  const farmers = data?.data ?? [];

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendFarmer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      addToast('Éleveur suspendu avec succès', 'success');
      setSuspendTarget(null);
    },
    onError: () => addToast('Erreur lors de la suspension', 'error'),
  });

  const createMutation = useMutation({
    mutationFn: () => createFarmer(addForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      addToast('Éleveur ajouté avec succès', 'success');
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
    },
    onError: () => addToast("Erreur lors de l'ajout", 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateFarmer(editTarget!.id, editForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      addToast('Éleveur modifié avec succès', 'success');
      setEditTarget(null);
    },
    onError: () => addToast('Erreur lors de la modification', 'error'),
  });

  function validateAdd() {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!addForm.full_name.trim()) errs.full_name = 'Champ requis';
    if (!addForm.phone.trim()) errs.phone = 'Champ requis';
    if (!addForm.country) errs.country = 'Champ requis';
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function openEdit(farmer: Farmer) {
    setEditForm({
      full_name: farmer.full_name,
      phone: farmer.phone ?? '',
      country: farmer.country,
      city: farmer.city ?? '',
      whatsapp_number: farmer.whatsapp_number ?? '',
      email: farmer.email ?? '',
      password: '',
    });
    setEditTarget(farmer);
  }

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
        <button
          onClick={() => { setAddForm(EMPTY_FORM); setAddErrors({}); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors"
        >
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
        <button
          onClick={() => farmers.length > 0 && exportCSV(farmers)}
          disabled={farmers.length === 0}
          className="flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-sm text-[#555555] rounded-btn hover:bg-[#F8FAF8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
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
                        <FarmerAvatar name={farmer.full_name} photoUrl={farmer.photo_url} />
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
                      {farmer.farms_count ?? 0} ferme{(farmer.farms_count ?? 0) > 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3.5">
                      {farmer.subscription && <PlanBadge plan={farmer.subscription.plan} />}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#1E6B2E]">
                      {farmer.cameras_count ?? 0} 📷
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#888888] italic">
                      {farmer.last_alert_at ? formatRelativeDate(farmer.last_alert_at) : 'Jamais'}
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
                          onClick={() => openEdit(farmer)}
                          className="p-1.5 rounded-lg hover:bg-[#F8FAF8] text-[#888888] hover:text-[#1A1A1A] transition-colors"
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

      {/* ── Modal Ajouter ─────────────────────────────────────────────────────── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Ajouter un éleveur">
        <div className="space-y-4">
          <FormField label="Nom complet *" error={addErrors.full_name}>
            <input
              type="text"
              value={addForm.full_name}
              onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Mbemba Jean"
              className={inputCls(!!addErrors.full_name)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Téléphone *" error={addErrors.phone}>
              <input
                type="tel"
                value={addForm.phone}
                onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+242 06 000 0000"
                className={inputCls(!!addErrors.phone)}
              />
            </FormField>
            <FormField label="Pays *" error={addErrors.country}>
              <select
                value={addForm.country}
                onChange={(e) => setAddForm((f) => ({ ...f, country: e.target.value }))}
                className={inputCls(!!addErrors.country)}
              >
                {COUNTRIES_FORM.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Ville">
            <input
              type="text"
              value={addForm.city}
              onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Brazzaville"
              className={inputCls(false)}
            />
          </FormField>
          <FormField label="Numéro WhatsApp">
            <input
              type="tel"
              value={addForm.whatsapp_number}
              onChange={(e) => setAddForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
              placeholder="+242064000000"
              className={inputCls(false)}
            />
          </FormField>
          <div className="border-t border-[#E8E8E8] pt-4">
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">Accès portail (optionnel)</p>
            <FormField label="Email de connexion">
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="eleveur@exemple.com"
                className={inputCls(false)}
              />
            </FormField>
            <div className="mt-3">
              <FormField label="Mot de passe initial">
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Laisser vide = pas d'accès email"
                  className={inputCls(false)}
                />
              </FormField>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 text-sm text-[#555555] border border-[#E8E8E8] rounded-btn hover:bg-[#F8FAF8] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => validateAdd() && createMutation.mutate()}
              disabled={createMutation.isPending}
              className="px-5 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors disabled:opacity-60"
            >
              {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal Modifier ────────────────────────────────────────────────────── */}
      <Modal open={editTarget !== null} onClose={() => setEditTarget(null)} title={`Modifier — ${editTarget?.full_name ?? ''}`}>
        <div className="space-y-4">
          {/* Photo upload */}
          {editTarget && (
            <div className="flex items-center gap-4 p-4 bg-[#F8FAF8] rounded-card border border-[#E8E8E8]">
              <div className="relative group flex-shrink-0">
                <FarmerAvatar name={editTarget.full_name} photoUrl={editTarget.photo_url} size="lg" />
                <label className={`absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${photoUploading ? 'opacity-100' : ''}`}>
                  {photoUploading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Camera size={16} className="text-white" />}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && editTarget) handlePhotoUpload(editTarget.id, file);
                    }}
                    disabled={photoUploading}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">Photo de profil</p>
                <p className="text-xs text-[#888888] mt-0.5">Survolez pour modifier · JPEG, PNG, WebP · max 5 Mo</p>
                {editTarget.photo_url && (
                  <p className="text-[10px] text-[#1E6B2E] mt-1 font-medium">✓ Photo enregistrée</p>
                )}
              </div>
            </div>
          )}
          <FormField label="Nom complet">
            <input
              type="text"
              value={editForm.full_name}
              onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              className={inputCls(false)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Téléphone">
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                className={inputCls(false)}
              />
            </FormField>
            <FormField label="Pays">
              <select
                value={editForm.country}
                onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
                className={inputCls(false)}
              >
                {COUNTRIES_FORM.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Ville">
            <input
              type="text"
              value={editForm.city}
              onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
              className={inputCls(false)}
            />
          </FormField>
          <FormField label="Numéro WhatsApp">
            <input
              type="tel"
              value={editForm.whatsapp_number}
              onChange={(e) => setEditForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
              className={inputCls(false)}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditTarget(null)}
              className="px-4 py-2.5 text-sm text-[#555555] border border-[#E8E8E8] rounded-btn hover:bg-[#F8FAF8] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 bg-[#1E6B2E] text-white text-sm font-bold rounded-btn hover:bg-[#17521F] transition-colors disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </Modal>

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? 'border-[#E24B4A] ring-1 ring-[#E24B4A]/40' : 'border-[#E8E8E8]'} rounded-btn px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1E6B2E]/30 focus:border-[#1E6B2E] transition-colors bg-white`;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#555555] mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-[#A32D2D] mt-1">{error}</p>}
    </div>
  );
}
