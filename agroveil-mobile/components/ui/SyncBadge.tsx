import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Colors } from '../../constants/colors';
import { StatusDot } from './StatusDot';
import { useAlertStore } from '../../store/alertStore';

export function SyncBadge() {
  const { isOnline, isSyncing, lastSyncAt, offlineQueue } = useAlertStore();

  const status = !isOnline ? 'offline' : isSyncing ? 'syncing' : 'online';

  let label: string;
  if (!isOnline) {
    label = `Hors-ligne · ${offlineQueue.length} alerte${offlineQueue.length !== 1 ? 's' : ''} en attente`;
  } else if (isSyncing) {
    label = 'Synchronisation...';
  } else if (lastSyncAt) {
    label = `Sync ${formatDistanceToNow(new Date(lastSyncAt), { locale: fr, addSuffix: true })}`;
  } else {
    label = 'En ligne';
  }

  return (
    <View style={styles.row}>
      <StatusDot status={status} />
      <Text style={[styles.text, !isOnline && styles.offline]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  text:    { fontSize: 12, color: Colors.onSurfaceVariant },
  offline: { color: Colors.offline },
});
