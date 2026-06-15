import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'filled' | 'outlined';
}

export function GreenButton({ label, loading, variant = 'filled', style, disabled, ...rest }: Props) {
  const filled = variant === 'filled';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.base,
        filled ? styles.filled : styles.outlined,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading
        ? <ActivityIndicator color={filled ? Colors.onPrimary : Colors.primary} />
        : <Text style={[styles.label, filled ? styles.labelFilled : styles.labelOutlined]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  filled:        { backgroundColor: Colors.primary },
  outlined:      { borderWidth: 1.5, borderColor: Colors.primary },
  disabled:      { opacity: 0.45 },
  label:         { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
  labelFilled:   { color: Colors.onPrimary },
  labelOutlined: { color: Colors.primary },
});
