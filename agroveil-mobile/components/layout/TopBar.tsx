import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAlertStore } from '../../store/alertStore';

interface Props {
  title: string;
  showLiveBadge?: boolean;
  showNotifBell?: boolean;
}

export function TopBar({ title, showLiveBadge = false, showNotifBell = true }: Props) {
  const insets = useSafeAreaInsets();
  const unreadCount = useAlertStore((s) => s.unreadCount);

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.sensorIcon}>📡</Text>
        <Text style={styles.title}>{title}</Text>
        {showLiveBadge && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN DIRECT</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        {showNotifBell && (
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bell}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <View style={styles.avatar}>
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar:        { backgroundColor: Colors.surfaceContainer, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sensorIcon: { fontSize: 18 },
  title:      { fontSize: 18, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  liveBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.errorContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  liveDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
  liveText:   { fontSize: 9, fontWeight: '700', color: Colors.onErrorContainer },
  actions:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn:    { position: 'relative' },
  bell:       { fontSize: 20 },
  badge:      { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  badgeText:  { fontSize: 9, color: Colors.onError, fontWeight: '700' },
  avatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
});
