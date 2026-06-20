import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  rightElement?: React.ReactNode;
}

export function SettingsHeader({ title, rightElement }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{rightElement ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar:     { backgroundColor: Colors.surfaceContainer, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '40' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  backIcon:{ fontSize: 24, color: Colors.onSurface, lineHeight: 28, marginTop: -2 },
  title:   { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.onSurface, letterSpacing: 0.3 },
  right:   { width: 36, alignItems: 'flex-end' },
});
