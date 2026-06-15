import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TopBar } from '../../components/layout/TopBar';

const MONTHS = ['Juin 2026', 'Mai 2026', 'Avril 2026', 'Mars 2026'];

export default function ReportsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TopBar title="RAPPORTS" showNotifBell={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Rapports Mensuels</Text>
        <Text style={styles.sub}>Historique de santé du troupeau</Text>
        {MONTHS.map((month) => (
          <TouchableOpacity key={month} style={styles.reportCard} activeOpacity={0.8}>
            <View style={styles.reportLeft}>
              <Text style={styles.reportIcon}>📊</Text>
              <View>
                <Text style={styles.reportTitle}>Rapport {month}</Text>
                <Text style={styles.reportSub}>Bâtiment A · Unité de production A1</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  scroll:      { flex: 1 },
  content:     { padding: 16, gap: 16 },
  title:       { fontSize: 24, fontWeight: '700', color: Colors.onSurface },
  sub:         { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: -8 },
  reportCard:  { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  reportLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reportIcon:  { fontSize: 24 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  reportSub:   { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  arrow:       { fontSize: 22, color: Colors.onSurfaceVariant },
});
