import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Colors } from '../../constants/colors';
import type { Alert } from '../../types';
import { SeverityBadge } from './SeverityBadge';

const BORDER_COLORS: Record<Alert['severity'], string> = {
  critical: Colors.error,
  warning:  Colors.tertiary,
  info:     Colors.secondary,
};

const TYPE_ICON: Record<Alert['type'], string> = {
  mortality:         '☠️',
  heat_stress:       '🌡️',
  inactivity:        '😴',
  cannibalism:       '⚔️',
  feeder_empty:      '🪣',
  abnormal_movement: '🚨',
  disease:           '🦠',
  other:             '⚠️',
};

interface Props {
  alert: Alert;
  onPress?: () => void;
  onResolve?: () => void;
  onWhatsApp?: () => void;
}

export function AlertCard({ alert, onPress, onResolve, onWhatsApp }: Props) {
  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { locale: fr, addSuffix: true });

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: BORDER_COLORS[alert.severity] }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.typeIcon}>{TYPE_ICON[alert.type]}</Text>
          <SeverityBadge severity={alert.severity} />
        </View>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {alert.snapshotUri ? (
          <Image source={{ uri: alert.snapshotUri }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={{ fontSize: 24 }}>{TYPE_ICON[alert.type]}</Text>
          </View>
        )}
        <View style={styles.bodyText}>
          <Text style={styles.desc}>{alert.description}</Text>
          <View style={styles.confidencePill}>
            <Text style={styles.confidenceText}>
              Confiance IA: {Math.round(alert.confidence * 100)}%
            </Text>
          </View>
          <Text style={styles.farm}>{alert.farmName} · {alert.cameraName}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnOutlined} onPress={onPress}>
          <Text style={styles.btnOutlinedText}>Détails</Text>
        </TouchableOpacity>

        {!alert.isResolved ? (
          <>
            <TouchableOpacity style={styles.btnResolve} onPress={onResolve}>
              <Text style={styles.btnResolveText}>Résoudre</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnWhatsApp} onPress={onWhatsApp}>
              <Text style={styles.btnWhatsAppText}>WhatsApp</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.resolvedChip}>
            <Text style={styles.resolvedText}>✓ Résolu</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:              { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, borderLeftWidth: 4, marginBottom: 12, overflow: 'hidden' },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 },
  headerLeft:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeIcon:          { fontSize: 18 },
  time:              { fontSize: 11, color: Colors.onSurfaceVariant },
  body:              { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 8 },
  thumbnail:         { width: 80, height: 60, borderRadius: 8, backgroundColor: Colors.surfaceContainerLowest },
  thumbnailPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.outlineVariant },
  bodyText:          { flex: 1, gap: 6 },
  desc:              { fontSize: 13, color: Colors.onSurface, fontWeight: '500', lineHeight: 18 },
  confidencePill:    { alignSelf: 'flex-start', backgroundColor: Colors.surfaceContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  confidenceText:    { fontSize: 11, color: Colors.onSurfaceVariant },
  farm:              { fontSize: 11, color: Colors.onSurfaceVariant },
  footer:            { flexDirection: 'row', gap: 8, padding: 14, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '40', alignItems: 'center' },
  btnOutlined:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary },
  btnOutlinedText:   { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  btnResolve:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.primaryContainer },
  btnResolveText:    { color: Colors.onPrimaryContainer, fontSize: 12, fontWeight: '600' },
  btnWhatsApp:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#25D366' },
  btnWhatsAppText:   { color: '#000', fontSize: 12, fontWeight: '600' },
  resolvedChip:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surfaceContainer },
  resolvedText:      { color: Colors.onSurfaceVariant, fontSize: 12 },
});
