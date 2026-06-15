import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import type { AlertSeverity } from '../../types';

const CONFIG: Record<AlertSeverity, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: Colors.errorContainer,       text: Colors.onErrorContainer,    dot: Colors.error,     label: 'CRITIQUE'     },
  warning:  { bg: Colors.tertiaryContainer,    text: Colors.onTertiaryContainer, dot: Colors.tertiary,  label: 'ATTENTION'    },
  info:     { bg: Colors.primaryContainer,     text: Colors.onPrimaryContainer,  dot: Colors.secondary, label: 'INFORMATION'  },
};

interface Props {
  severity: AlertSeverity;
  dot?: boolean;
}

export function SeverityBadge({ severity, dot = false }: Props) {
  const cfg = CONFIG[severity];
  if (dot) {
    return <View style={[styles.dot, { backgroundColor: cfg.dot }]} />;
  }
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dot:   { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
});
