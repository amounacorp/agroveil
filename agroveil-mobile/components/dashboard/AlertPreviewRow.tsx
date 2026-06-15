import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Colors } from '../../constants/colors';
import type { Alert } from '../../types';
import { SeverityBadge } from '../alerts/SeverityBadge';

interface Props {
  alert: Alert;
  onPress?: () => void;
}

export function AlertPreviewRow({ alert, onPress }: Props) {
  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { locale: fr, addSuffix: true });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <SeverityBadge severity={alert.severity} dot />
      <View style={styles.content}>
        <Text style={styles.desc} numberOfLines={1}>{alert.description}</Text>
        <Text style={styles.meta}>{alert.cameraName} · {timeAgo}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '40' },
  content: { flex: 1 },
  desc:    { fontSize: 13, color: Colors.onSurface, fontWeight: '500' },
  meta:    { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  arrow:   { fontSize: 20, color: Colors.onSurfaceVariant },
});
