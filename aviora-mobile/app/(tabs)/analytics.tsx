import { format, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { HealthGauge } from '../../components/dashboard/HealthGauge';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { useFarmStats, useWeeklyActivity } from '../../hooks/useFarmStats';
import { useAlerts } from '../../hooks/useAlerts';

export default function AnalyticsScreen() {
  const { data: stats }        = useFarmStats();
  const { data: weekly = [] }  = useWeeklyActivity();
  const { data: alerts = [] }  = useAlerts();

  const now      = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'd MMM', { locale: fr });
  const weekEnd   = format(endOfWeek(now,   { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr });

  const resolvedCount  = alerts.filter((a) => a.isResolved).length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.isResolved);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="ANALYTICS" />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View>
          <Text style={styles.heading}>Rapport Hebdomadaire</Text>
          <Text style={styles.subheading}>{weekStart} – {weekEnd}</Text>
        </View>

        {/* Health score gauge */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score de Santé Global</Text>
            <View style={styles.gaugeWrap}>
              <HealthGauge stats={stats} />
            </View>
          </View>
        )}

        {/* Weekly chart */}
        {weekly.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tendance hebdomadaire</Text>
            <ActivityChart data={weekly} />
          </View>
        )}

        {/* Stats grid — derived from real data */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard
              label="Taux de mortalité"
              value={`${stats.mortalityRate}%`}
              sub="ce mois"
              color={stats.mortalityRate > 2 ? Colors.error : Colors.secondary}
            />
            <StatCard
              label="Score de santé"
              value={`${stats.healthScore}`}
              sub="pts / semaine"
              color={Colors.primary}
            />
            <StatCard
              label="Alertes résolues"
              value={`${resolvedCount}`}
              sub="cette semaine"
              color={Colors.tertiary}
            />
            <StatCard
              label="Taux d'activité"
              value={`${stats.activityRate}%`}
              sub="du troupeau"
              color={Colors.secondary}
            />
          </View>
        )}

        {/* Active critical alerts as IA banner */}
        {criticalAlerts.slice(0, 1).map((alert) => (
          <View key={alert.id} style={styles.alertBanner}>
            <View style={styles.alertBannerIcon}>
              <Text style={{ fontSize: 18 }}>⚠️</Text>
            </View>
            <View style={styles.alertBannerText}>
              <Text style={styles.alertBannerTitle}>Alerte IA : {alert.type.replace('_', ' ')}</Text>
              <Text style={styles.alertBannerDesc}>{alert.description}</Text>
            </View>
          </View>
        ))}

        {!stats && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Chargement des données…</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.background },
  scroll:           { flex: 1 },
  content:          { padding: 16, gap: 16 },
  heading:          { fontSize: 24, fontWeight: '700', color: Colors.onSurface },
  subheading:       { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  card:             { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.outlineVariant + '50', gap: 12 },
  cardTitle:        { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  gaugeWrap:        { alignItems: 'center' },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:         { flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '50', gap: 4 },
  statValue:        { fontSize: 26, fontWeight: '700' },
  statLabel:        { fontSize: 12, color: Colors.onSurface, fontWeight: '500' },
  statSub:          { fontSize: 11, color: Colors.onSurfaceVariant },
  alertBanner:      { backgroundColor: Colors.errorContainer + '33', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.errorContainer + '50', flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  alertBannerIcon:  { backgroundColor: Colors.errorContainer, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  alertBannerText:  { flex: 1 },
  alertBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.error, textTransform: 'capitalize' },
  alertBannerDesc:  { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
  placeholder:      { alignItems: 'center', paddingVertical: 32 },
  placeholderText:  { fontSize: 13, color: Colors.onSurfaceVariant },
});
