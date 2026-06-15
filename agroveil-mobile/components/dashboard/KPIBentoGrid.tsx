import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import type { FarmStats } from '../../types';

interface KPICard {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  borderColor: string;
}

interface Props {
  stats: FarmStats;
}

export function KPIBentoGrid({ stats }: Props) {
  const cards: KPICard[] = [
    { icon: '👥', label: 'Total Volaille', value: stats.totalBirds,   color: Colors.onSurface,  borderColor: Colors.outlineVariant },
    { icon: '✅', label: 'Sain',           value: stats.healthyCount, color: Colors.secondary,  borderColor: Colors.secondary + '33' },
    { icon: '⚠️', label: 'Malade',         value: stats.sickCount,    color: Colors.tertiary,   borderColor: Colors.tertiary + '33' },
    { icon: '🚨', label: 'Alertes',        value: stats.alertsToday,  color: Colors.error,      borderColor: Colors.error + '33' },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <View key={card.label} style={[styles.card, { borderColor: card.borderColor }]}>
          <Text style={styles.icon}>{card.icon}</Text>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:  { flex: 1, minWidth: '45%', backgroundColor: Colors.surfaceContainerHigh, borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  icon:  { fontSize: 20 },
  label: { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '500' },
  value: { fontSize: 28, fontWeight: '700' },
});
