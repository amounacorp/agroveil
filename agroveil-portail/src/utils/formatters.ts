import { formatDistanceToNow, format, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AlertType, AlertSeverity, SeverityColors } from '../types';

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR').replace(/\s/g, ' ')} FCFA`;
}

export function formatRelative(isoDate: string): string {
  const date = parseISO(isoDate);
  if (isYesterday(date)) {
    return `Hier à ${format(date, 'HH\'h\'mm', { locale: fr })}`;
  }
  return `Il y a ${formatDistanceToNow(date, { locale: fr })}`;
}

export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return format(date, 'MMMM yyyy', { locale: fr })
    .replace(/^./, (c) => c.toUpperCase());
}

export function formatAlertType(type: AlertType): string {
  const map: Record<AlertType, string> = {
    mortality: 'Mortalité détectée',
    heat_stress: 'Stress thermique',
    inactivity: 'Inactivité anormale',
    cannibalism: 'Cannibalisme détecté',
    feeder_empty: 'Mangeoire vide',
    abnormal_movement: 'Mouvement anormal',
  };
  return map[type];
}

export function formatSeverity(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    critical: 'CRITIQUE',
    warning: 'ATTENTION',
    info: 'INFO',
  };
  return map[severity];
}

export function getSeverityColors(severity: AlertSeverity): SeverityColors {
  const map: Record<AlertSeverity, SeverityColors> = {
    critical: { text: '#A32D2D', bg: '#FCEBEB', border: '#E24B4A' },
    warning: { text: '#854F0B', bg: '#FAEEDA', border: '#EF9F27' },
    info: { text: '#0C447C', bg: '#E6F1FB', border: '#378ADD' },
  };
  return map[severity];
}

export function getHealthColor(label: string): string {
  const map: Record<string, string> = {
    Excellent: '#1E6B2E',
    Bon: '#27500A',
    Attention: '#EF9F27',
    Critique: '#A32D2D',
  };
  return map[label] ?? '#1A1A1A';
}

export function formatTrend(trend: 'up' | 'stable' | 'down'): string {
  const map = { up: '⬆', stable: '➡', down: '⬇' };
  return map[trend];
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
