import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';
import { OfflineBanner } from '../../components/ui/OfflineBanner';
import { FilterPills, type AlertFilter } from '../../components/alerts/FilterPills';
import { AlertCard } from '../../components/alerts/AlertCard';
import { useAlerts, useResolveAlert } from '../../hooks/useAlerts';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useAlertStore } from '../../store/alertStore';
import type { Alert } from '../../types';

export default function AlertsScreen() {
  const [filter, setFilter] = useState<AlertFilter>('all');
  const { data: alerts = [], isLoading } = useAlerts(filter);
  const resolve = useResolveAlert();
  const { sendAlert } = useWhatsApp();
  const markAllRead = useAlertStore((s) => s.markAllRead);

  useFocusEffect(useCallback(() => {
    markAllRead();
  }, [markAllRead]));

  function handleWhatsApp(alert: Alert) {
    sendAlert({ alert });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="ALERTES" showNotifBell />
      <OfflineBanner />

      <View style={styles.header}>
        <Text style={styles.title}>Alertes de Santé</Text>
        <FilterPills active={filter} onChange={setFilter} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={() => router.push({ pathname: '/alert/[id]', params: { id: item.id } })}
            onResolve={() => resolve.mutate(item.id)}
            onWhatsApp={() => handleWhatsApp(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>Aucune alerte pour ce filtre</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.background },
  header:    { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },
  title:     { fontSize: 22, fontWeight: '700', color: Colors.onSurface },
  list:      { paddingHorizontal: 16, paddingBottom: 100 },
  empty:     { alignItems: 'center', paddingTop: 48, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: Colors.onSurfaceVariant },
});
