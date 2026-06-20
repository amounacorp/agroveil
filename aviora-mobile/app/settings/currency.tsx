import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settingsStore';
import { useT } from '../../hooks/useT';
import { CURRENCY_LABELS, type Currency } from '../../i18n/translations';

export default function CurrencyScreen() {
  const { currency, setCurrency } = useSettingsStore();
  const t = useT();
  const currencies = Object.entries(CURRENCY_LABELS) as [Currency, string][];

  function select(code: Currency) {
    setCurrency(code);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>‹ {t.common.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.currency.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{t.currency.subtitle}</Text>

        {currencies.map(([code, label]) => (
          <TouchableOpacity
            key={code}
            style={[styles.option, currency === code && styles.optionActive]}
            onPress={() => select(code)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionLabel, currency === code && styles.optionLabelActive]}>
              {label}
            </Text>
            {currency === code && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{t.currency.note}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: Colors.background },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '30' },
  backBtn:           { width: 60 },
  backText:          { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  title:             { fontSize: 13, fontWeight: '800', color: Colors.onSurface, letterSpacing: 1.5, textTransform: 'uppercase' },
  scroll:            { flex: 1 },
  content:           { padding: 16, gap: 10 },
  subtitle:          { fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 8 },
  option:            { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: 'transparent' },
  optionActive:      { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer + '40' },
  optionLabel:       { fontSize: 15, fontWeight: '500', color: Colors.onSurface },
  optionLabelActive: { color: Colors.primary, fontWeight: '700' },
  check:             { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  noteBox:           { marginTop: 12, backgroundColor: Colors.surfaceContainer, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  noteText:          { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
});
