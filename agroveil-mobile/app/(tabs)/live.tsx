import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { KPIBentoGrid } from '../../components/dashboard/KPIBentoGrid';
import { LiveCameraView } from '../../components/camera/LiveCameraView';
import { HealthGauge } from '../../components/dashboard/HealthGauge';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { GreenButton } from '../../components/ui/GreenButton';
import { useFarmStats } from '../../hooks/useFarmStats';
import { useAIDetection } from '../../modules/ai/useAIDetection';
import { MOCK_STATS } from '../../mocks';

export default function LiveScreen() {
  const { data: stats = MOCK_STATS } = useFarmStats();
  const { boxes, isModelReady } = useAIDetection();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="LIVE MONITOR" showLiveBadge />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* KPI bento grid */}
        <KPIBentoGrid stats={stats} />

        {/* Camera feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📹 Flux Caméra IA 01</Text>
          <LiveCameraView
            boxes={boxes}
            isAIActive={isModelReady}
            fps={30}
            cameraName="Caméra 01"
          />
        </View>

        {/* Climate card */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌡️ Climatisation Unité</Text>
            <View style={styles.climateRow}>
              <Text style={styles.climateLabel}>Température</Text>
              <Text style={styles.climateValue}>28.5°C</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%', backgroundColor: Colors.tertiary }]} />
            </View>
            <View style={styles.climateRow}>
              <Text style={styles.climateLabel}>Humidité</Text>
              <Text style={styles.climateValue}>62%</Text>
            </View>
          </View>

          {/* AI recommendation card */}
          <View style={[styles.card, styles.cardFlex]}>
            <Text style={styles.cardTitle}>🤖 Recommandation IA</Text>
            <Text style={styles.aiText}>
              L'IA a identifié {stats.sickCount} cas de léthargie dans le secteur Est.
              Il est recommandé de vérifier l'accès à l'eau et d'isoler les sujets marqués.
            </Text>
            <GreenButton label="Générer Rapport Détaillé" style={{ marginTop: 12 }} onPress={() => {}} />
          </View>
        </View>

        {/* Health gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.sectionTitle}>Score de Santé du Troupeau</Text>
          <HealthGauge stats={stats} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  scroll:        { flex: 1 },
  content:       { padding: 16, gap: 16 },
  section:       { gap: 10 },
  sectionTitle:  { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  row:           { flexDirection: 'row', gap: 12 },
  card:          { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '50', gap: 10 },
  cardFlex:      { flex: 1 },
  cardTitle:     { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  climateRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  climateLabel:  { fontSize: 13, color: Colors.onSurfaceVariant },
  climateValue:  { fontSize: 20, fontWeight: '700', color: Colors.onSurface },
  progressBar:   { height: 6, backgroundColor: Colors.surfaceVariant, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 3 },
  aiText:        { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 20 },
  gaugeCard:     { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: Colors.outlineVariant + '50', alignItems: 'center', gap: 16 },
});
