import jsPDF from 'jspdf';
import type { MonthlyReport, Farm, Alert } from '../types';
import { formatFCFA, formatDate } from './formatters';

export async function generateReportPDF(
  report: MonthlyReport,
  farm: Farm,
  alerts: Alert[]
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header
  doc.setFillColor(30, 107, 46);
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AgroVeil', 14, 14);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Portail Fermier Intelligent', 14, 22);
  doc.setFontSize(12);
  doc.text(`Rapport ${report.month_label}`, pageW - 14, 18, { align: 'right' });

  y = 42;
  doc.setTextColor(26, 26, 26);

  // Farm info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(farm.name, 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(85, 85, 85);
  doc.text(`${farm.location_city} · Généré le ${formatDate(new Date().toISOString())}`, 14, y);

  y += 14;

  // KPI row
  doc.setTextColor(26, 26, 26);
  const kpis = [
    { label: 'Score santé', value: `${report.health_score_avg}%` },
    { label: 'Mortalité', value: `${report.mortality_rate}%` },
    { label: 'Alertes', value: String(report.alert_count) },
    { label: 'Effectif moyen', value: String(report.avg_bird_count) },
  ];
  const colW = (pageW - 28) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = 14 + i * colW;
    doc.setFillColor(234, 243, 222);
    doc.roundedRect(x, y, colW - 4, 18, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 107, 46);
    doc.text(kpi.value, x + (colW - 4) / 2, y + 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(85, 85, 85);
    doc.text(kpi.label, x + (colW - 4) / 2, y + 16, { align: 'center' });
  });

  y += 28;

  // Alerts section
  if (alerts.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text('Historique des alertes', 14, y);
    y += 8;

    const severityColors: Record<string, [number, number, number]> = {
      critical: [163, 45, 45],
      warning: [133, 79, 11],
      info: [12, 68, 124],
    };

    alerts.slice(0, 15).forEach((alert) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      const [r, g, b] = severityColors[alert.severity] ?? [26, 26, 26];
      doc.setFillColor(r, g, b);
      doc.rect(14, y, 2, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(alert.description.substring(0, 80), 20, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(136, 136, 136);
      doc.text(formatDate(alert.created_at), pageW - 14, y + 5, { align: 'right' });
      y += 10;
    });
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(248, 250, 248);
  doc.rect(0, pageH - 14, pageW, 14, 'F');
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text('AgroVeil — Portail Fermier Intelligent', 14, pageH - 5);
  doc.text(`${farm.name} · ${report.month_label}`, pageW - 14, pageH - 5, { align: 'right' });

  const filename = `AgroVeil_Rapport_${report.month_label.replace(' ', '_')}_${farm.name.replace(/\s/g, '_')}.pdf`;
  doc.save(filename);
}

export function shareOnWhatsApp(report: MonthlyReport, farm: Farm): void {
  const msg = encodeURIComponent(
    `📊 *Rapport AgroVeil — ${report.month_label}*\n` +
    `🏠 ${farm.name}\n\n` +
    `✅ Score santé : ${report.health_score_avg}%\n` +
    `📉 Mortalité : ${report.mortality_rate}%\n` +
    `🔔 Alertes : ${report.alert_count}\n` +
    `🐦 Effectif moyen : ${report.avg_bird_count} oiseaux\n\n` +
    `Généré par AgroVeil`
  );
  window.open(`whatsapp://send?text=${msg}`, '_blank');
}

export { formatFCFA };
