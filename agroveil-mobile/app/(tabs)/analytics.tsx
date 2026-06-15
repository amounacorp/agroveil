import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { HealthGauge } from '../../components/dashboard/HealthGauge';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { useFarmStats, useWeeklyActivity } from '../../hooks/useFarmStats';
import { MOCK_STATS, MOCK_WEEKLY } from '../../mocks';

const HEATMAP_TEMPS = [34, 32, 30, 29, 32, 32, 31, 30, 29, 30, 30, 28];

export default function AnalyticsScreen() {
  const { data: stats = MOCK_STATS } = useFarmStats();
  const { data: weekly = MOCK_WEEKLY } = useWeeklyActivity();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="ANALYTICS" />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Top heading */}
        <View>
          <Text style={styles.heading}>Rapport Hebdomadaire</Text>
          <Text style={styles.subheading}>Unité de production A1 · 12–18 Mai</Text>
        </View>

        {/* Health score gauge */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score de Santé Global</Text>
          <View style={styles.gaugeWrap}>
            <HealthGauge stats={stats} />
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tendance hebdomadaire</Text>
          <ActivityChart data={weekly} />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Taux de mortalité" value={`${stats.mortalityRate}%`} sub="ce mois" color={Colors.secondary} />
          <StatCard label="Score moyen"        value={`${stats.healthScore}`}    sub="pts/semaine" color={Colors.primary} />
          <StatCard label="Alertes évitées"    value="12"                        sub="ce mois" color={Colors.tertiary} />
          <StatCard label="Temps de réponse"   value="4 min"                     sub="moyenne" color={Colors.secondary} />
        </View>

        {/* Heatmap */}
        <View style={styles.card}>
          <View style={styles.heatmapHeader}>
            <Text style={styles.cardTitle}>Carte Thermique</Text>
            <Text style={styles.heatmapAvg}>🌡️ 31°C Moy.</Text>
          </View>
          <View style={styles.heatmapGrid}>
            {HEATMAP_TEMPS.map((temp, i) => (
              <View
                key={i}
                style={[
                  styles.heatCell,
                  { backgroundColor: temp > 33 ? Colors.errorContainer : temp > 31 ? Colors.tertiaryContainer : Colors.primaryContainer },
                ]}
              >
                <Text style={[styles.heatTemp, { color: temp > 33 ? Colors.onErrorContainer : temp > 31 ? Colors.onTertiaryContainer : Colors.onPrimaryContainer }]}>
                  {temp}°
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.heatmapLabels}>
            <Text style={styles.heatLabel}>Entrée Ouest</Text>
            <Text style={styles.heatLabel}>Sortie Est</Text>
          </View>
        </View>

        {/* AI alert banner */}
        <View style={styles.alertBanner}>
          <View style={styles.alertBannerIcon}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
          </View>
          <View style={styles.alertBannerText}>
            <Text style={styles.alertBannerTitle}>Alerte IA: Anomalie Thermique</Text>
            <Text style={styles.alertBannerDesc}>
              Zone Ouest a dépassé 34°C pendant 15 minutes. Risque de stress thermique détecté.
            </Text>
          </View>
        </View>

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
  heatmapHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heatmapAvg:       { fontSize: 13, fontWeight: '600', color: Colors.secondary },
  heatmapGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell:         { width: '22%', aspectRatio: 1.5, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  heatTemp:         { fontSize: 12, fontWeight: '700' },
  heatmapLabels:    { flexDirection: 'row', justifyContent: 'space-between' },
  heatLabel:        { fontSize: 11, color: Colors.onSurfaceVariant },
  alertBanner:      { backgroundColor: Colors.errorContainer + '33', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.errorContainer + '50', flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  alertBannerIcon:  { backgroundColor: Colors.errorContainer, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  alertBannerText:  { flex: 1 },
  alertBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.error },
  alertBannerDesc:  { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
});
