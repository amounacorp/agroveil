import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { useReports } from '../../hooks/useReports';
import type { MonthlyReport } from '../../types';

const TREND_ICON: Record<MonthlyReport['trend'], string> = {
  up:     '📈',
  stable: '➡️',
  down:   '📉',
};


export default function ReportsScreen() {
  const { data: reports, isLoading, isError, refetch } = useReports();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="RAPPORTS" showNotifBell={false} />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>Rapports Mensuels</Text>
          <Text style={styles.sub}>Historique de santé du troupeau</Text>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Chargement des rapports…</Text>
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Impossible de charger les rapports</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && reports?.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucun rapport disponible</Text>
            <Text style={styles.emptyText}>
              Les rapports mensuels apparaîtront ici au fil du temps.
            </Text>
          </View>
        )}

        {reports?.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportCard({ report }: { report: MonthlyReport }) {
  return (
    <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
      <View style={styles.reportHeader}>
        <View style={styles.reportLeft}>
          <Text style={styles.reportIcon}>📊</Text>
          <View>
            <Text style={styles.reportTitle}>Rapport {report.month_label}</Text>
            <Text style={styles.reportSub}>
              {report.avg_bird_count} oiseaux · {report.alert_count} alerte{report.alert_count !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={[styles.trendIcon]}>{TREND_ICON[report.trend]}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatPill label="Santé moy." value={`${report.health_score_avg}%`} color={Colors.primary} />
        <StatPill label="Mortalité"  value={`${report.mortality_rate}%`}   color={report.mortality_rate > 2 ? Colors.error : Colors.secondary} />
        <StatPill label="Alertes"    value={`${report.alert_count}`}        color={Colors.tertiary} />
      </View>

      {report.pdf_url && (
        <Text style={[styles.reportSub, { color: Colors.primary, marginTop: 4 }]}>
          📄 PDF disponible
        </Text>
      )}
    </TouchableOpacity>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  scroll:      { flex: 1 },
  content:     { padding: 16, gap: 14 },
  title:       { fontSize: 24, fontWeight: '700', color: Colors.onSurface },
  sub:         { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },

  center:      { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 14, color: Colors.onSurfaceVariant },
  errorIcon:   { fontSize: 36 },
  errorText:   { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center' },
  retryBtn:    { backgroundColor: Colors.primaryContainer, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText:   { fontSize: 14, fontWeight: '600', color: Colors.onPrimaryContainer },
  emptyIcon:   { fontSize: 36 },
  emptyTitle:  { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  emptyText:   { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },

  reportCard:   { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIcon:   { fontSize: 24 },
  reportTitle:  { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  reportSub:    { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  trendIcon:    { fontSize: 18 },

  statsRow:     { flexDirection: 'row', gap: 8 },
  pill:         { flex: 1, backgroundColor: Colors.surfaceContainer, borderRadius: 8, paddingVertical: 8, alignItems: 'center', gap: 2 },
  pillValue:    { fontSize: 15, fontWeight: '700' },
  pillLabel:    { fontSize: 10, color: Colors.onSurfaceVariant, fontWeight: '500' },
});
