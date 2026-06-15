import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import type { FarmStats } from '../../types';

const RADIUS = 48;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LABEL_COLORS: Record<FarmStats['healthLabel'], string> = {
  Excellent: Colors.secondary,
  Bon:       Colors.primary,
  Attention: Colors.tertiary,
  Critique:  Colors.error,
};

interface Props {
  stats: FarmStats;
  size?: 'sm' | 'lg';
}

export function HealthGauge({ stats, size = 'lg' }: Props) {
  const dim = size === 'lg' ? 140 : 80;
  const r   = size === 'lg' ? RADIUS : 28;
  const sw  = size === 'lg' ? STROKE : 5;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - stats.healthScore / 100);
  const labelColor = LABEL_COLORS[stats.healthLabel];

  return (
    <View style={styles.container}>
      <View style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={dim} height={dim} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={dim / 2} cy={dim / 2} r={r}
            stroke={Colors.surfaceVariant} strokeWidth={sw}
            fill="transparent"
          />
          <Circle
            cx={dim / 2} cy={dim / 2} r={r}
            stroke={Colors.primary} strokeWidth={sw}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.score, size === 'sm' && styles.scoreSmall]}>{stats.healthScore}</Text>
          {size === 'lg' && <Text style={styles.pct}>%</Text>}
        </View>
      </View>
      {size === 'lg' && (
        <View style={styles.meta}>
          <Text style={[styles.healthLabel, { color: labelColor }]}>{stats.healthLabel}</Text>
          <View style={styles.subRow}>
            <SubStat label="Mortalité" value={`${stats.mortalityRate}%`} />
            <SubStat label="Stress"    value={`${stats.stressRate}%`} />
            <SubStat label="Activité"  value={`${stats.activityRate}%`} />
          </View>
        </View>
      )}
    </View>
  );
}

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.subValue}>{value}</Text>
      <Text style={styles.subLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { alignItems: 'center', gap: 12 },
  center:      { alignItems: 'center' },
  score:       { fontSize: 32, fontWeight: '700', color: Colors.primary },
  scoreSmall:  { fontSize: 16 },
  pct:         { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: -4 },
  meta:        { alignItems: 'center', gap: 8 },
  healthLabel: { fontSize: 14, fontWeight: '700' },
  subRow:      { flexDirection: 'row', gap: 24 },
  subValue:    { fontSize: 16, fontWeight: '700', color: Colors.onSurface, textAlign: 'center' },
  subLabel:    { fontSize: 11, color: Colors.onSurfaceVariant },
});
