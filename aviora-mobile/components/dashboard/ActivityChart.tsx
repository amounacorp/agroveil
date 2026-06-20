import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import type { WeeklyActivity } from '../../types';

interface Props {
  data: WeeklyActivity[];
  compact?: boolean;
}

const { width: SCREEN_W } = Dimensions.get('window');

export function ActivityChart({ data, compact = false }: Props) {
  const maxVal = Math.max(...data.flatMap((d) => [d.healthy, d.sick]));
  const chartH = compact ? 80 : 160;

  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.legend}>
          <LegendDot color={Colors.primary}  label="Sain" />
          <LegendDot color={Colors.error}    label="Malade" />
        </View>
      )}
      <View style={[styles.chart, { height: chartH }]}>
        <View style={styles.bars}>
          {data.map((d, i) => {
            const healthyH = (d.healthy / maxVal) * (chartH - 24);
            const sickH    = (d.sick    / maxVal) * (chartH - 24);
            return (
              <View key={i} style={styles.barGroup}>
                <View style={styles.barStack}>
                  <View style={[styles.bar, { height: sickH,    backgroundColor: Colors.error }]} />
                  <View style={[styles.bar, { height: healthyH, backgroundColor: Colors.primary }]} />
                </View>
                <Text style={[styles.dayLabel, d.sick > 20 && { color: Colors.error }]}>{d.day}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.baseline} />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { gap: 12 },
  legend:      { flexDirection: 'row', gap: 12 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:         { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.onSurfaceVariant },
  chart:       { justifyContent: 'flex-end' },
  bars:        { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1, paddingHorizontal: 4 },
  barGroup:    { flex: 1, alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  barStack:    { width: '70%', gap: 2, alignItems: 'stretch' },
  bar:         { borderRadius: 2, minHeight: 2 },
  dayLabel:    { fontSize: 11, color: Colors.onSurfaceVariant, fontWeight: '500' },
  baseline:    { height: 1, backgroundColor: Colors.outlineVariant, marginTop: 2 },
});
