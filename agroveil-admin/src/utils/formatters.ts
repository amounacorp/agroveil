import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' FCFA';
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return 'Il y a ' + formatDistanceToNow(date, { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return format(date, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatAlertType(type: string): string {
  const labels: Record<string, string> = {
    mortality: 'Mortalité détectée',
    heat_stress: 'Stress thermique',
    inactivity: 'Inactivité anormale',
    cannibalism: 'Cannibalisme',
    feeder_empty: 'Mangeoire vide',
    abnormal_movement: 'Mouvement anormal',
  };
  return labels[type] ?? type;
}

export function formatCountry(code: string): string {
  const countries: Record<string, string> = {
    CG: '🇨🇬 Congo',
    CM: '🇨🇲 Cameroun',
    SN: '🇸🇳 Sénégal',
    CI: "🇨🇮 Côte d'Ivoire",
    GA: '🇬🇦 Gabon',
    CD: 'RDC',
  };
  return countries[code] ?? code;
}

export function formatPlan(plan: string): string {
  const labels: Record<string, string> = {
    free: 'FREE',
    eleveur: 'ÉLEVEUR',
    pro: 'PRO',
    cooperative: 'COOP',
  };
  return labels[plan] ?? plan.toUpperCase();
}

export function formatSeverity(severity: string): string {
  const labels: Record<string, string> = {
    critical: 'CRITIQUE',
    warning: 'ATTENTION',
    info: 'INFO',
  };
  return labels[severity] ?? severity.toUpperCase();
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR');
}
