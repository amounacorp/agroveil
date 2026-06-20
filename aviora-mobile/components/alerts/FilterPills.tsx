import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

export type AlertFilter = 'all' | 'critical' | 'warning' | 'info' | 'resolved';

const FILTERS: { key: AlertFilter; label: string }[] = [
  { key: 'all',      label: 'Toutes'   },
  { key: 'critical', label: 'Critiques' },
  { key: 'warning',  label: 'Attention' },
  { key: 'info',     label: 'Info'      },
  { key: 'resolved', label: 'Résolues'  },
];

interface Props {
  active: AlertFilter;
  onChange: (filter: AlertFilter) => void;
}

export function FilterPills({ active, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map((f) => {
        const isActive = f.key === active;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:          { gap: 8, paddingBottom: 4, paddingHorizontal: 2 },
  pill:         { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, minHeight: 34, justifyContent: 'center' },
  pillActive:   { backgroundColor: Colors.secondaryContainer },
  pillInactive: { backgroundColor: Colors.surfaceContainerHigh },
  label:        { fontSize: 13, fontWeight: '600' },
  labelActive:  { color: Colors.onSecondaryContainer },
  labelInactive:{ color: Colors.onSurfaceVariant },
});
