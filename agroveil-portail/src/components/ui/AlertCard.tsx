import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { getSeverityColors, formatSeverity, formatAlertType, formatRelative } from '../../utils/formatters';
import type { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  onResolve?: (id: string) => void;
  compact?: boolean;
}

export function AlertCard({ alert, onResolve, compact = false }: AlertCardProps) {
  const colors = getSeverityColors(alert.severity);

  return (
    <div
      className="bg-white rounded-card shadow-card border border-[#E8E8E8] overflow-hidden"
      style={{ borderLeft: `4px solid ${colors.border}` }}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase"
            style={{ color: colors.text, backgroundColor: colors.bg }}
          >
            {formatSeverity(alert.severity)}
          </span>
          <span className="font-semibold text-[15px] text-[#1A1A1A]">
            {formatAlertType(alert.alert_type)}
          </span>
          <span className="ml-auto text-xs text-[#888888]">{formatRelative(alert.created_at)}</span>
        </div>

        {!compact && (
          <p className="text-sm text-[#555555] mb-3 leading-relaxed">{alert.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-2 py-0.5 rounded-pill">
            {alert.camera_name}
          </span>
          {!compact && (
            <span className="text-xs bg-[#EAF3DE] text-[#27500A] px-2 py-0.5 rounded-pill">
              Confiance IA : {alert.confidence}%
            </span>
          )}

          <div className="ml-auto flex gap-2">
            <Link
              to={`/alertes/${alert.id}`}
              className="text-xs px-3 py-1.5 border border-[#1E6B2E] text-[#1E6B2E] rounded-btn hover:bg-[#EAF3DE] transition-colors"
            >
              Voir détail
            </Link>
            {!alert.is_resolved && onResolve ? (
              <button
                onClick={() => onResolve(alert.id)}
                className="text-xs px-3 py-1.5 bg-[#1E6B2E] text-white rounded-btn hover:bg-[#0F3D1A] transition-colors"
              >
                Marquer résolu
              </button>
            ) : alert.is_resolved ? (
              <span className="text-xs flex items-center gap-1 px-3 py-1.5 text-[#888888] border border-[#E8E8E8] rounded-btn">
                <CheckCircle size={12} /> Résolu
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
