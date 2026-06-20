import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, CheckCircle, Phone } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import AlertBadge from '../../components/ui/AlertBadge';
import FarmerAvatar from '../../components/ui/FarmerAvatar';
import PlanBadge from '../../components/ui/PlanBadge';
import AISnapshot from '../../components/ui/AISnapshot';
import WhatsAppBtn from '../../components/ui/WhatsAppBtn';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getAlert, resolveAlert, sendWhatsApp } from '../../api/alerts';
import { getFarmer } from '../../api/farmers';
import { formatAlertType, formatDate, formatRelativeDate } from '../../utils/formatters';
import { useUIStore } from '../../store/uiStore';

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();

  const { data: alert, isLoading } = useQuery({
    queryKey: ['alert', id],
    queryFn: () => getAlert(id!),
    enabled: !!id,
  });

  const { data: farmer } = useQuery({
    queryKey: ['farmer', alert?.farmer_id],
    queryFn: () => getFarmer(alert!.farmer_id),
    enabled: !!alert?.farmer_id,
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveAlert(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast('Alerte marquée comme résolue', 'success');
    },
    onError: () => addToast('Erreur lors de la résolution', 'error'),
  });

  const whatsappMutation = useMutation({
    mutationFn: () => sendWhatsApp(id!),
    onSuccess: () => addToast('Message WhatsApp envoyé à l\'éleveur', 'success'),
    onError: () => addToast("Erreur d'envoi WhatsApp", 'error'),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Chargement de l'alerte..." />
        </div>
      </AdminLayout>
    );
  }

  if (!alert) return null;

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#888888] mb-6">
        <Link to="/admin" className="hover:text-[#1E6B2E]">Tableau de bord</Link>
        <ChevronRight size={14} />
        <Link to="/admin/alerts" className="hover:text-[#1E6B2E]">Alertes</Link>
        <ChevronRight size={14} />
        <span className="text-[#1A1A1A] font-semibold">Alerte #{alert.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* LEFT: 60% */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Alert header */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertBadge severity={alert.severity} size="md" />
                <span className="text-xs text-[#888888] font-mono">#{alert.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">
                {formatAlertType(alert.alert_type)}
              </h2>
              <p className="text-sm text-[#888888] mt-1">{alert.farm_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-[#888888] font-bold uppercase mb-1">
                {formatRelativeDate(alert.created_at).toUpperCase()}
              </p>
              <p className="text-sm font-mono text-[#A32D2D]">
                {formatDate(alert.created_at)}
              </p>
            </div>
          </div>

          {/* AI Snapshot */}
          <AISnapshot
            imageUrl={alert.snapshot_url || undefined}
            confidence={alert.confidence}
            alertType={formatAlertType(alert.alert_type)}
          />

          {/* Timeline */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-6">
            <h3 className="font-bold text-[#1A1A1A] mb-5 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#EAF3DE] rounded text-[#1E6B2E] flex items-center justify-center text-xs">⏱</span>
              Chronologie
            </h3>
            <div className="relative border-l-2 border-[#E8E8E8] ml-3 space-y-5">
              {[
                { title: 'Alerte déclenchée', text: alert.description, time: formatDate(alert.created_at), color: 'bg-[#A32D2D]', icon: '🔴' },
                { title: 'Vérification automatique IA', text: `Confiance : ${alert.confidence.toFixed(1)}%`, time: formatDate(alert.created_at), color: 'bg-[#1E6B2E]', icon: '🤖' },
                { title: 'Notification WhatsApp', text: alert.whatsapp_sent ? 'Message envoyé à l\'éleveur' : 'En attente', time: '', color: 'bg-[#888888]', icon: '💬' },
              ].map((step, i) => (
                <div key={i} className="relative pl-8">
                  <span className={`absolute -left-[13px] top-0.5 w-6 h-6 ${step.color} rounded-full flex items-center justify-center text-xs`}>
                    {step.icon}
                  </span>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">{step.title}</p>
                      <p className="text-xs text-[#888888]">{step.text}</p>
                    </div>
                    {step.time && (
                      <span className="text-[10px] font-mono text-[#888888] flex-shrink-0">{step.time.split('à')[1]?.trim()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {!alert.is_resolved && (
              <button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="flex items-center gap-2 px-5 py-3 bg-[#1E6B2E] text-white font-bold rounded-btn hover:bg-[#17521F] transition-colors disabled:opacity-60 shadow-md"
              >
                <CheckCircle size={18} />
                {resolveMutation.isPending ? 'Résolution...' : 'Marquer résolu'}
              </button>
            )}
            <WhatsAppBtn
              onClick={() => whatsappMutation.mutate()}
              label="WhatsApp éleveur"
              loading={whatsappMutation.isPending}
            />
            <button className="flex items-center gap-2 px-5 py-3 border border-[#E8E8E8] bg-white text-[#555555] font-medium rounded-btn hover:bg-[#F8FAF8] transition-colors">
              <Phone size={16} /> Appeler l'éleveur
            </button>
          </div>
        </div>

        {/* RIGHT: 40% */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Farmer card */}
          {farmer && (
            <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5 border-l-4 border-l-[#1E6B2E]">
              <div className="flex items-center gap-3 mb-4">
                <FarmerAvatar name={farmer.full_name} size="lg" />
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">{farmer.full_name}</h4>
                  <p className="text-xs text-[#888888]">{farmer.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {farmer.subscription && <PlanBadge plan={farmer.subscription.plan} />}
                  </div>
                </div>
              </div>
              <Link
                to={`/admin/farmers/${farmer.id}`}
                className="text-xs font-bold text-[#1E6B2E] hover:underline"
              >
                Voir la fiche complète →
              </Link>
            </div>
          )}

          {/* Stats card */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-4">
              Statistiques ferme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total', value: '450', color: 'text-[#1A1A1A]', bg: 'bg-[#F8FAF8]' },
                { label: 'Sains 🟢', value: '424', color: 'text-[#1E6B2E]', bg: 'bg-[#EAF3DE]' },
                { label: 'Sous surveillance 🟡', value: '24', color: 'text-[#854F0B]', bg: 'bg-[#FAEEDA]' },
                { label: 'Décédés 🔴', value: '2', color: 'text-[#A32D2D]', bg: 'bg-[#FCEBEB]' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 border border-[#E8E8E8]`}>
                  <p className="text-[10px] text-[#888888] font-medium">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI confidence */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-4">
              Score de confiance IA
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-[#1E6B2E]">{alert.confidence.toFixed(1)}%</span>
              <span className="text-xs font-bold text-[#27500A] bg-[#EAF3DE] px-2 py-1 rounded-pill">
                Très fiable
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#E8E8E8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E6B2E] rounded-full transition-all duration-700"
                style={{ width: `${alert.confidence}%` }}
              />
            </div>
          </div>

          {/* WhatsApp preview */}
          <div className="bg-white rounded-card border border-[#E8E8E8] shadow-card p-5">
            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">
              Message envoyé à l'éleveur
            </h3>
            <div className="bg-[#DCF8C6] rounded-xl p-3 text-sm text-[#1A1A1A] font-mono border border-[#B5E7A0]">
              <p className="font-bold text-[#A32D2D] mb-1">🚨 Aviora Alerte CRITIQUE</p>
              <p>Ferme: {alert.farm_name}</p>
              <p>Type: {formatAlertType(alert.alert_type)}</p>
              <p>Heure: {formatDate(alert.created_at).split('à')[1]?.trim()}</p>
              <p className="mt-1">Confiance IA: {alert.confidence.toFixed(0)}%</p>
              <p className="mt-1 font-bold text-[#A32D2D]">→ Vérifiez immédiatement</p>
            </div>
            <p className={`text-[10px] mt-2 ${alert.whatsapp_sent ? 'text-[#27500A]' : 'text-[#888888]'}`}>
              {alert.whatsapp_sent ? '✓ Message envoyé' : 'En attente d\'envoi'}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
