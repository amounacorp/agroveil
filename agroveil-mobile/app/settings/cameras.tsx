import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';
import { useCameras } from '../../hooks/useCameras';

export default function CamerasScreen() {
  const { data: cameras = [], isLoading, error } = useCameras();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Mes Caméras" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            📹 Les caméras sont configurées par votre administrateur via le portail AgroVeil. Contactez-le pour ajouter ou modifier une caméra.
          </Text>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Chargement des caméras…</Text>
          </View>
        )}

        {!isLoading && !!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ Impossible de charger les caméras.</Text>
            <Text style={styles.errorSub}>Vérifiez votre connexion internet.</Text>
          </View>
        )}

        {!isLoading && !error && cameras.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyTitle}>Aucune caméra configurée</Text>
            <Text style={styles.emptySub}>
              Demandez à votre administrateur d'ajouter vos caméras via le portail web AgroVeil.
            </Text>
          </View>
        )}

        {cameras.map((cam) => {
          const isActive = cam.status === 'active';
          const isError  = cam.status === 'error';
          const dotColor = isActive ? Colors.secondary : isError ? Colors.error : Colors.outlineVariant;
          const statusLabel = isActive ? 'Actif' : isError ? 'Erreur' : 'Inactif';

          return (
            <View key={cam.id} style={styles.camCard}>
              <View style={styles.camHeader}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <Text style={styles.camName}>{cam.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: dotColor + '30' }]}>
                  <Text style={[styles.statusText, { color: dotColor }]}>{statusLabel.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.camDetails}>
                <CamDetail label="ID" value={cam.id} />
                <CamDetail label="Enregistrement" value={cam.isRecording ? '🔴 En cours' : '⏹ Arrêté'} />
                {cam.isRecording && <CamDetail label="Qualité" value={`${cam.fps} FPS · ${cam.resolution}`} />}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CamDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  content:     { padding: 16, gap: 12 },
  infoBanner:  { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: Colors.tertiary },
  infoText:    { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
  center:      { alignItems: 'center', padding: 40, gap: 12 },
  loadingText: { color: Colors.onSurfaceVariant, fontSize: 14 },
  errorBox:    { backgroundColor: Colors.errorContainer + '30', borderRadius: 12, padding: 16, alignItems: 'center', gap: 4 },
  errorText:   { color: Colors.error, fontSize: 14, fontWeight: '600' },
  errorSub:    { color: Colors.onSurfaceVariant, fontSize: 12 },
  emptyBox:    { alignItems: 'center', padding: 40, gap: 12 },
  emptyIcon:   { fontSize: 56 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  emptySub:    { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  camCard:     { backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  camHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  camName:     { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  camDetails:  { gap: 6 },
});

const detailStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '25' },
  label: { fontSize: 13, color: Colors.onSurfaceVariant },
  value: { fontSize: 13, color: Colors.onSurface, fontWeight: '500' },
});
