import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';
import { LocalStorage, StorageKeys } from '../../services/offline/LocalStorage';

function useNetworkStatus() {
  const [online, setOnline] = React.useState(true);
  React.useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setOnline(s.isConnected ?? true));
    return unsub;
  }, []);
  return online;
}

export default function SyncScreen() {
  const online    = useNetworkStatus();
  const qc        = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [lastSync] = useState(() => {
    const raw = LocalStorage.get<string>(StorageKeys.LAST_SYNC);
    return raw ? new Date(raw) : null;
  });
  const [syncDone, setSyncDone] = useState(false);

  async function handleManualSync() {
    if (!online) return;
    setSyncing(true);
    setSyncDone(false);
    try {
      await qc.invalidateQueries();
      await qc.refetchQueries({ type: 'active' });
      LocalStorage.set(StorageKeys.LAST_SYNC, new Date().toISOString());
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    } finally {
      setSyncing(false);
    }
  }

  const lastSyncLabel = lastSync
    ? lastSync.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Jamais';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Synchronisation" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Network status */}
        <View style={[styles.statusCard, { borderColor: online ? Colors.secondary + '60' : Colors.error + '60' }]}>
          <View style={[styles.dot, { backgroundColor: online ? Colors.secondary : Colors.error }]} />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>{online ? 'Connecté' : 'Hors ligne'}</Text>
            <Text style={styles.statusSub}>
              {online ? 'Les données se synchronisent automatiquement' : 'Les données seront synchronisées à la reconnexion'}
            </Text>
          </View>
        </View>

        {/* Sync info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 État de la synchronisation</Text>

          <InfoRow label="Dernière synchronisation" value={lastSyncLabel} />
          <InfoRow label="Mode" value={online ? 'Temps réel' : 'Cache local'} />

          <View style={styles.divider} />

          <Text style={styles.syncNote}>
            Les alertes, statistiques et données caméras sont synchronisées automatiquement toutes les minutes lorsque vous êtes connecté.
          </Text>
        </View>

        {/* Manual sync */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔄 Synchronisation manuelle</Text>
          <Text style={styles.cardSub}>Forcer la mise à jour immédiate de toutes les données.</Text>

          {syncDone && <Text style={styles.doneMsg}>✅ Synchronisation terminée</Text>}

          <TouchableOpacity
            style={[styles.syncBtn, (!online || syncing) && styles.syncBtnDisabled]}
            onPress={handleManualSync}
            disabled={!online || syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Text style={styles.syncBtnText}>🔄  Synchroniser maintenant</Text>
            )}
          </TouchableOpacity>

          {!online && (
            <Text style={styles.offlineHint}>Synchronisation impossible hors ligne</Text>
          )}
        </View>

        {/* Cache info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💾 Données en cache</Text>
          <Text style={styles.cardSub}>
            L'application conserve vos données localement pour fonctionner sans connexion internet.
          </Text>
          <InfoRow label="Alertes" value="Disponibles hors ligne" />
          <InfoRow label="Statistiques" value="30 secondes de fraîcheur" />
          <InfoRow label="Caméras" value="5 minutes de fraîcheur" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  content:       { padding: 16, gap: 12 },
  statusCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, borderWidth: 1 },
  dot:           { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  statusText:    { flex: 1, gap: 2 },
  statusTitle:   { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  statusSub:     { fontSize: 12, color: Colors.onSurfaceVariant },
  card:          { backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  cardTitle:     { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardSub:       { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
  divider:       { height: 1, backgroundColor: Colors.outlineVariant + '40' },
  syncNote:      { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
  doneMsg:       { color: Colors.secondary, fontSize: 13, textAlign: 'center', padding: 8 },
  syncBtn:       { backgroundColor: Colors.primaryContainer, borderRadius: 12, padding: 16, alignItems: 'center' },
  syncBtnDisabled: { opacity: 0.5 },
  syncBtnText:   { fontSize: 14, fontWeight: '700', color: Colors.onPrimaryContainer },
  offlineHint:   { fontSize: 12, color: Colors.error, textAlign: 'center' },
});

const infoStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '25' },
  label: { fontSize: 13, color: Colors.onSurfaceVariant },
  value: { fontSize: 13, color: Colors.onSurface, fontWeight: '500' },
});
