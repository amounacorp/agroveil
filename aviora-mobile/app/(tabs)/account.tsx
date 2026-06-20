import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage } from '../../services/offline/LocalStorage';
import { API_URL } from '../../constants/api';
import { useT } from '../../hooks/useT';
import { useSettingsStore } from '../../store/settingsStore';
import { LANG_LABELS, CURRENCY_LABELS } from '../../i18n/translations';

export default function AccountScreen() {
  const { user, logout } = useAuthStore();
  const t = useT();
  const { lang, currency } = useSettingsStore();

  function handleLogout() {
    LocalStorage.clear();
    logout();
    router.replace('/(auth)/login');
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const photoUri = user?.photo_url
    ? (user.photo_url.startsWith('http') ? user.photo_url : `${API_URL}${user.photo_url}`)
    : null;

  const menuItems = [
    { icon: '🔔', label: t.account.notifications, sub: t.account.notificationsSub, route: '/settings/notifications' },
    { icon: '📹', label: t.account.cameras,        sub: t.account.camerasSub,       route: '/settings/cameras'       },
    { icon: '🤖', label: t.account.aiSettings,     sub: t.account.aiSettingsSub,    route: '/settings/ai-params'     },
    { icon: '📡', label: t.account.sync,            sub: t.account.syncSub,          route: '/settings/sync'          },
    { icon: '🌐', label: t.account.language,        sub: LANG_LABELS[lang],          route: '/settings/language'      },
    { icon: '💱', label: t.account.currency,        sub: CURRENCY_LABELS[currency],  route: '/settings/currency'      },
    { icon: '❓', label: t.account.help,            sub: t.account.helpSub,          route: '/settings/help'          },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title={t.account.title} showNotifBell={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{user?.full_name ?? 'Fermier Demo'}</Text>
          {user?.city && user?.country
            ? <Text style={styles.location}>{user.city}, {user.country}</Text>
            : <Text style={styles.location}>{user?.country ?? ''}</Text>
          }
          <Text style={styles.contact}>{user?.phone || user?.email || ''}</Text>

          <View style={styles.planBadge}>
            <Text style={styles.planText}>{t.account.freePlan}</Text>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/profile/edit')}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>{t.account.editProfile}</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => router.push(item.route as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>{t.account.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          Aviora v1.0.0{user ? ` · ${user.id}` : ` · ${t.account.demoMode}`}
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.background },
  scroll:         { flex: 1 },
  content:        { padding: 16, gap: 12 },

  profileCard:    { backgroundColor: Colors.surfaceContainer, borderRadius: 16, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.outlineVariant + '50' },
  avatarWrap:     { marginBottom: 6 },
  avatarImg:      { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: Colors.primary },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 26, fontWeight: '700', color: Colors.onPrimaryContainer },
  name:           { fontSize: 20, fontWeight: '700', color: Colors.onSurface },
  location:       { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  contact:        { fontSize: 12, color: Colors.onSurfaceVariant },
  planBadge:      { backgroundColor: Colors.secondaryContainer, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  planText:       { fontSize: 12, fontWeight: '600', color: Colors.onSecondaryContainer },
  editBtn:        { marginTop: 10, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: Colors.outlineVariant + '60' },
  editBtnText:    { fontSize: 13, fontWeight: '600', color: Colors.onSurface },

  menuItem:       { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  menuIcon:       { fontSize: 22 },
  menuText:       { flex: 1 },
  menuLabel:      { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  menuSub:        { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  arrow:          { fontSize: 20, color: Colors.onSurfaceVariant },

  logoutBtn:      { backgroundColor: Colors.errorContainer, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText:     { fontSize: 14, fontWeight: '700', color: Colors.onErrorContainer },
  version:        { textAlign: 'center', fontSize: 11, color: Colors.outlineVariant },
});
