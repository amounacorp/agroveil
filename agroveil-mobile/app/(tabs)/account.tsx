import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage } from '../../services/offline/LocalStorage';

const MENU_ITEMS = [
  { icon: '🔔', label: 'Notifications', sub: 'Alertes WhatsApp et push' },
  { icon: '📹', label: 'Caméras',        sub: 'Configurer vos appareils' },
  { icon: '🤖', label: 'Paramètres IA',  sub: 'Seuils de détection' },
  { icon: '📡', label: 'Synchronisation',sub: 'Mode hors-ligne et sync' },
  { icon: '❓', label: 'Aide',            sub: 'Guide d\'utilisation' },
];

export default function AccountScreen() {
  const { user, logout } = useAuthStore();

  function handleLogout() {
    LocalStorage.clear();
    logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="COMPTE" showNotifBell={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={styles.name}>{user ? `${user.firstName} ${user.lastName}` : 'Fermier Demo'}</Text>
          <Text style={styles.farm}>{user?.farmName ?? 'Bâtiment A'}</Text>
          <Text style={styles.phone}>{user?.phone ?? '+225 00 00 00 00'}</Text>
        </View>

        {/* Menu */}
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.8}>
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
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AgroVeil v1.0.0 · Mode démo activé</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  scroll:      { flex: 1 },
  content:     { padding: 16, gap: 12 },
  profileCard: { backgroundColor: Colors.surfaceContainer, borderRadius: 16, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.outlineVariant + '50' },
  avatar:      { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.secondaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  name:        { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  farm:        { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  phone:       { fontSize: 12, color: Colors.onSurfaceVariant },
  menuItem:    { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  menuIcon:    { fontSize: 22 },
  menuText:    { flex: 1 },
  menuLabel:   { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  menuSub:     { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  arrow:       { fontSize: 20, color: Colors.onSurfaceVariant },
  logoutBtn:   { backgroundColor: Colors.errorContainer, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText:  { fontSize: 14, fontWeight: '700', color: Colors.onErrorContainer },
  version:     { textAlign: 'center', fontSize: 11, color: Colors.outlineVariant },
});
