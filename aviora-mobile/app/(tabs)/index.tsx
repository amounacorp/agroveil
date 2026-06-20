import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { KPIBentoGrid } from '../../components/dashboard/KPIBentoGrid';
import { HealthGauge } from '../../components/dashboard/HealthGauge';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { AlertPreviewRow } from '../../components/dashboard/AlertPreviewRow';
import { SyncBadge } from '../../components/ui/SyncBadge';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { TopBar } from '../../components/layout/TopBar';
import { useFarmStats, useWeeklyActivity } from '../../hooks/useFarmStats';
import { useAlerts } from '../../hooks/useAlerts';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useCameras } from '../../hooks/useCameras';
import { useAuthStore } from '../../store/authStore';
import type { CameraStatus } from '../../types';

export default function DashboardScreen() {
  useOfflineSync();
  const { data: stats }        = useFarmStats();
  const { data: weekly = [] }  = useWeeklyActivity();
  const { data: alerts = [] }  = useAlerts();
  const { data: cameras = [] } = useCameras();
  const user        = useAuthStore((s) => s.user);
  const firstName   = user?.first_name ?? 'Fermier';
  const recentAlerts = alerts.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="ACCUEIL" />
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Welcome */}
        <View style={styles.welcome}>
          <View>
            <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text>
            <Text style={styles.greetingSub}>
              {!stats
                ? 'Chargement…'
                : stats.healthLabel === 'Excellent' || stats.healthLabel === 'Bon'
                  ? 'Troupeau en bonne forme aujourd\'hui'
                  : 'Attention requise sur votre troupeau'}
            </Text>
          </View>
          <SyncBadge />
        </View>

        {/* KPI bento */}
        {stats && <KPIBentoGrid stats={stats} />}

        {/* Health gauge compact */}
        {stats && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Score de Santé</Text>
            <View style={styles.gaugeRow}>
              <HealthGauge stats={stats} size="sm" />
              <View style={styles.gaugeInfo}>
                <Text style={styles.gaugeLabel}>{stats.healthLabel}</Text>
                <Text style={styles.gaugeSub}>
                  Mortalité: {stats.mortalityRate}% · Stress: {stats.stressRate}%
                </Text>
                <Text style={styles.gaugeSub}>
                  Activité: {stats.activityRate}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Camera cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📹 Caméras</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.camsRow}>
            {cameras.map((cam) => (
              <CameraCard key={cam.id} cam={cam} onPress={() => router.push('/(tabs)/live')} />
            ))}
          </ScrollView>
        </View>

        {/* Weekly chart */}
        {weekly.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Activité 7 Jours</Text>
            <ActivityChart data={weekly} compact />
          </View>
        )}

        {/* Recent alerts */}
        <View style={styles.section}>
          <View style={styles.alertsHeader}>
            <Text style={styles.sectionTitle}>Alertes Récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
              <Text style={styles.seeAll}>Voir toutes →</Text>
            </TouchableOpacity>
          </View>
          {recentAlerts.map((a) => (
            <AlertPreviewRow
              key={a.id}
              alert={a}
              onPress={() => router.push({ pathname: '/alert/[id]', params: { id: a.id } })}
            />
          ))}
          {recentAlerts.length === 0 && (
            <Text style={styles.noAlerts}>Aucune alerte récente ✅</Text>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CameraCard({ cam, onPress }: { cam: CameraStatus; onPress: () => void }) {
  const dotColor = cam.status === 'active' ? Colors.secondary : cam.status === 'error' ? Colors.error : Colors.outlineVariant;
  return (
    <TouchableOpacity style={styles.camCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.camHeader}>
        <View style={[styles.camDot, { backgroundColor: dotColor }]} />
        <Text style={styles.camStatus}>{cam.status === 'active' ? 'ACTIF' : cam.status === 'error' ? 'ERREUR' : 'INACTIF'}</Text>
      </View>
      <Text style={styles.camName}>{cam.name}</Text>
      {cam.isRecording && (
        <Text style={styles.camFps}>{cam.fps} FPS · {cam.resolution}</Text>
      )}
      <TouchableOpacity style={styles.camBtn} onPress={onPress}>
        <Text style={styles.camBtnText}>Voir en direct</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  scroll:       { flex: 1 },
  content:      { padding: 16, gap: 16 },
  welcome:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { fontSize: 22, fontWeight: '700', color: Colors.onSurface },
  greetingSub:  { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  section:      { gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  card:         { backgroundColor: Colors.surfaceContainer, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '50' },
  gaugeRow:     { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 12 },
  gaugeInfo:    { flex: 1, gap: 4 },
  gaugeLabel:   { fontSize: 18, fontWeight: '700', color: Colors.primary },
  gaugeSub:     { fontSize: 12, color: Colors.onSurfaceVariant },
  camsRow:      { gap: 10, paddingBottom: 4 },
  camCard:      { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14, width: 160, gap: 6, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  camHeader:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  camDot:       { width: 8, height: 8, borderRadius: 4 },
  camStatus:    { fontSize: 10, fontWeight: '700', color: Colors.onSurfaceVariant },
  camName:      { fontSize: 13, fontWeight: '600', color: Colors.onSurface },
  camFps:       { fontSize: 11, color: Colors.onSurfaceVariant },
  camBtn:       { marginTop: 4, backgroundColor: Colors.primaryContainer, borderRadius: 16, paddingVertical: 6, alignItems: 'center' },
  camBtnText:   { fontSize: 11, fontWeight: '600', color: Colors.onPrimaryContainer },
  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll:       { fontSize: 13, color: Colors.tertiary, fontWeight: '600' },
  noAlerts:     { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 16 },
});
