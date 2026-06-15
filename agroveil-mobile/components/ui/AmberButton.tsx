import React from 'react';
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props extends TouchableOpacityProps {
  label: string;
}

export function AmberButton({ label, style, ...rest }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.btn, style]} {...rest}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:   { minHeight: 48, borderRadius: 24, backgroundColor: Colors.tertiary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { color: Colors.onTertiary, fontSize: 14, fontWeight: '600' },
});
