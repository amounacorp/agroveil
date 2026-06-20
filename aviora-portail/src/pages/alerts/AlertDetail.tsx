import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';
import { FarmerLayout } from '../../components/layout/FarmerLayout';
import { AlertCardSkeleton } from '../../components/ui/LoadingSkeleton';
import { useAlert, useResolveAlert } from '../../hooks/useAlerts';
import { useUIStore } from '../../store/uiStore';
import {
  getSeverityColors, formatSeverity, formatAlertType,
  formatDate, formatRelative
} from '../../utils/formatters';

function shareAlertOnWhatsApp(description: string, type: string) {
  const msg = encodeURIComponent(
    `🔔 *Alerte Aviora — ${type}*\n${description}\n\nGérez vos alertes sur le portail Aviora.`
  );
  window.open(`whatsapp://send?text=${msg}`, '_blank');
}

export function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { data: alert, isLoading } = useAlert(id ?? '');
  const resolveAlert = useResolveAlert();

  const handleResolve = async () => {
    if (!alert) return;
    try {
      await resolveAlert.mutateAsync(alert.id);
      addToast('Alerte marquée comme résolue ✓', 'success');
      navigate('/alertes');
    } catch {
      addToast('Impossible de résoudre l\'alerte', 'error');
    }
  };

  if (isLoading) {
    return (
      <FarmerLayout>
        <div className="space-y-4">
          <AlertCardSkeleton />
          <AlertCardSkeleton />
        </div>
      </FarmerLayout>
    );
  }

  if (!alert) return null;

  const colors = getSeverityColors(alert.severity);

  return (
    <FarmerLayout>
      <Link to="/alertes" className="inline-flex items-center gap-2 text-sm text-[#555555] hover:text-[#1E6B2E] mb-5 transition-colors">
        <ArrowLeft size={15} /> Mes alertes
      </Link>

      {/* Alert header */}
      <div
        className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5 mb-4"
        style={{ borderLeft: `6px solid ${colors.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-pill uppercase" style={{ color: colors.text, backgroundColor: colors.bg }}>
            {formatSeverity(alert.severity)}
          </span>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{formatAlertType(alert.alert_type)}</h1>
        </div>
        <p className="text-sm text-[#888888]">
          {alert.camera_name} · {formatDate(alert.created_at)}
        </p>
        {alert.is_resolved && alert.resolved_at && (
          <p className="text-xs text-[#27500A] mt-1 flex items-center gap-1">
            <CheckCircle size={12} /> Résolu {formatRelative(alert.resolved_at)}
          </p>
        )}
      </div>

      {/* AI Expert Advice */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] mb-4 overflow-hidden">
        <div className="bg-[#1E6B2E] px-5 py-3 flex items-center gap-2">
          <Shield size={16} className="text-[#8BD88E]" />
          <h2 className="text-white font-semibold">Conseil Aviora</h2>
        </div>
        <div className="p-5 space-y-5">
          {/* What happened */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-[#EF9F27]" /> Ce que l'IA a détecté
            </h3>
            <p className="text-sm text-[#555555] leading-relaxed">{alert.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[#27500A]">Confiance IA</span>
              <div className="flex-1 h-2 bg-[#E8E8E8] rounded-pill overflow-hidden">
                <div className="h-full bg-[#1E6B2E] rounded-pill" style={{ width: `${alert.confidence}%` }} />
              </div>
              <span className="text-xs font-bold text-[#1E6B2E]">{alert.confidence}%</span>
            </div>
          </div>

          {/* Do now */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-3">
              <CheckCircle size={15} className="text-[#1E6B2E]" /> Que faire maintenant ?
            </h3>
            <div className="space-y-2">
              {alert.immediate_steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1E6B2E] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#555555] leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prevention */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-2">
              <Shield size={15} className="text-[#1E6B2E]" /> Comment éviter que ça se reproduise ?
            </h3>
            <div className="bg-[#EAF3DE] rounded-btn p-3">
              <p className="text-sm text-[#27500A] leading-relaxed">{alert.prevention_tip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot */}
      {alert.snapshot_url && (
        <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5 mb-4">
          <h3 className="font-semibold text-[#1A1A1A] mb-3">Photo de détection</h3>
          <div className="relative rounded-btn overflow-hidden aspect-video bg-[#F0F0F0]">
            <img src={alert.snapshot_url} alt="Capture IA" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-[#A32D2D] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              🔴 ALERTE IA
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-card shadow-card border border-[#E8E8E8] p-5 mb-24 md:mb-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <Clock size={15} /> Chronologie
        </h3>
        <div className="space-y-3">
          {[
            { dot: 'bg-[#A32D2D]', time: formatDate(alert.created_at), label: 'Alerte déclenchée' },
            { dot: 'bg-[#EF9F27]', time: '— 2 min', label: 'Inactivité détectée' },
            { dot: 'bg-[#EF9F27]', time: '— 7 min', label: 'Légère baisse d\'activité' },
            { dot: 'bg-[#1E6B2E]', time: '— 30 min', label: 'Troupeau normal' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
              <span className="text-xs text-[#888888] w-36 flex-shrink-0">{item.time}</span>
              <span className="text-sm text-[#1A1A1A]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky action buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-60 right-0 bg-white border-t border-[#E8E8E8] p-4 flex gap-3 z-30">
        {!alert.is_resolved && (
          <button
            onClick={handleResolve}
            className="flex-1 h-12 bg-[#1E6B2E] text-white font-semibold rounded-btn flex items-center justify-center gap-2 hover:bg-[#0F3D1A] transition-colors"
          >
            <CheckCircle size={16} /> Marquer résolu
          </button>
        )}
        <button
          onClick={() => shareAlertOnWhatsApp(alert.description, formatAlertType(alert.alert_type))}
          className="flex-1 h-12 bg-[#25D366] text-white font-semibold rounded-btn flex items-center justify-center gap-2 hover:bg-[#1DA851] transition-colors"
        >
          <MessageCircle size={16} /> Envoyer sur WhatsApp
        </button>
      </div>
    </FarmerLayout>
  );
}
