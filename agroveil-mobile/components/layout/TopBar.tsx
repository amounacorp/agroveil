import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAlertStore } from '../../store/alertStore';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../constants/api';

interface Props {
  title: string;
  showLiveBadge?: boolean;
  showNotifBell?: boolean;
}

export function TopBar({ title, showLiveBadge = false, showNotifBell = true }: Props) {
  const insets      = useSafeAreaInsets();
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const user        = useAuthStore((s) => s.user);
  const initials    = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const photoUri    = user?.photo_url
    ? (user.photo_url.startsWith('http') ? user.photo_url : `${API_URL}${user.photo_url}`)
    : null;

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
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/account')} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarInitials}>{initials}</Text>
          )}
        </TouchableOpacity>
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
  avatar:         { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:      { width: 36, height: 36, borderRadius: 18 },
  avatarInitials: { fontSize: 13, fontWeight: '700', color: Colors.onPrimaryContainer },
});
