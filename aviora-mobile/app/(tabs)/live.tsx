import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { KPIBentoGrid } from '../../components/dashboard/KPIBentoGrid';
import { LiveCameraView } from '../../components/camera/LiveCameraView';
import { HealthGauge } from '../../components/dashboard/HealthGauge';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { GreenButton } from '../../components/ui/GreenButton';
import { useFarmStats } from '../../hooks/useFarmStats';
import { useAIDetection } from '../../modules/ai/useAIDetection';

export default function LiveScreen() {
  useKeepAwake();
  const { data: stats }           = useFarmStats();
  const { boxes, isModelReady }   = useAIDetection();

  const sickCount = stats?.sickCount ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="LIVE MONITOR" showLiveBadge />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* KPI bento grid */}
        {stats && <KPIBentoGrid stats={stats} />}

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

        {/* AI recommendation card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 Recommandation IA</Text>
          {sickCount > 0 ? (
            <Text style={styles.aiText}>
              L'IA a identifié {sickCount} cas suspect{sickCount > 1 ? 's' : ''} dans le troupeau.
              Il est recommandé de vérifier l'accès à l'eau et d'isoler les sujets marqués.
            </Text>
          ) : (
            <Text style={styles.aiText}>
              Aucune anomalie détectée pour le moment. Le troupeau semble en bonne santé.
            </Text>
          )}
          <GreenButton label="Générer Rapport Détaillé" style={{ marginTop: 12 }} onPress={() => {}} />
        </View>

        {/* Health gauge */}
        {stats && (
          <View style={styles.gaugeCard}>
            <Text style={styles.sectionTitle}>Score de Santé du Troupeau</Text>
            <HealthGauge stats={stats} />
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  scroll:       { flex: 1 },
  content:      { padding: 16, gap: 16 },
  section:      { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  card:         { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '50', gap: 10 },
  cardTitle:    { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  aiText:       { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 20 },
  gaugeCard:    { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: Colors.outlineVariant + '50', alignItems: 'center', gap: 16 },
});
