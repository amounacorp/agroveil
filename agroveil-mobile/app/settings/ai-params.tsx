import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';
import { GreenButton } from '../../components/ui/GreenButton';
import { LocalStorage } from '../../services/offline/LocalStorage';

interface AIConfig {
  confidenceThreshold: number;
  detectionIntervalFrames: number;
  alertDebounceSeconds: number;
}

const DEFAULTS: AIConfig = {
  confidenceThreshold:     parseFloat(process.env.EXPO_PUBLIC_AI_CONFIDENCE_THRESHOLD ?? '0.75'),
  detectionIntervalFrames: parseInt(process.env.EXPO_PUBLIC_DETECTION_INTERVAL_FRAMES ?? '30'),
  alertDebounceSeconds:    parseInt(process.env.EXPO_PUBLIC_ALERT_DEBOUNCE_SECONDS ?? '300'),
};
const AI_CONFIG_KEY = 'ai_config';

function loadConfig(): AIConfig {
  return LocalStorage.get<AIConfig>(AI_CONFIG_KEY) ?? DEFAULTS;
}

const CONF_OPTIONS   = [0.50, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];
const INTERVAL_OPTIONS = [10, 15, 20, 25, 30, 45, 60];
const DEBOUNCE_OPTIONS = [60, 120, 180, 300, 600];

export default function AIParamsScreen() {
  const [config, setConfig] = useState(loadConfig);
  const [saved,  setSaved]  = useState(false);

  function set(patch: Partial<AIConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
    setSaved(false);
  }

  function handleSave() {
    LocalStorage.set(AI_CONFIG_KEY, config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    LocalStorage.remove(AI_CONFIG_KEY);
    setConfig(DEFAULTS);
    setSaved(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Paramètres IA" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Confidence */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Seuil de confiance</Text>
          <Text style={styles.cardSub}>
            Niveau minimum de certitude pour qu'une détection génère une alerte. Plus élevé = moins de faux positifs.
          </Text>
          <Text style={styles.currentVal}>{Math.round(config.confidenceThreshold * 100)}%</Text>
          <View style={styles.pills}>
            {CONF_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.pill, config.confidenceThreshold === v && styles.pillActive]}
                onPress={() => set({ confidenceThreshold: v })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, config.confidenceThreshold === v && styles.pillTextActive]}>
                  {Math.round(v * 100)}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interval */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎞️ Intervalle de détection</Text>
          <Text style={styles.cardSub}>
            Nombre de frames entre chaque analyse IA. Plus bas = plus précis mais plus gourmand en ressources.
          </Text>
          <Text style={styles.currentVal}>Toutes les {config.detectionIntervalFrames} frames</Text>
          <View style={styles.pills}>
            {INTERVAL_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.pill, config.detectionIntervalFrames === v && styles.pillActive]}
                onPress={() => set({ detectionIntervalFrames: v })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, config.detectionIntervalFrames === v && styles.pillTextActive]}>
                  {v}f
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debounce */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Délai entre alertes</Text>
          <Text style={styles.cardSub}>
            Durée minimale entre deux alertes du même type. Évite le spam de notifications.
          </Text>
          <Text style={styles.currentVal}>
            {config.alertDebounceSeconds < 60
              ? `${config.alertDebounceSeconds}s`
              : `${config.alertDebounceSeconds / 60} min`}
          </Text>
          <View style={styles.pills}>
            {DEBOUNCE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.pill, config.alertDebounceSeconds === v && styles.pillActive]}
                onPress={() => set({ alertDebounceSeconds: v })}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, config.alertDebounceSeconds === v && styles.pillTextActive]}>
                  {v < 60 ? `${v}s` : `${v / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {saved && <Text style={styles.savedMsg}>✅ Paramètres IA sauvegardés</Text>}

        <GreenButton label="Sauvegarder" onPress={handleSave} style={styles.btn} />

        <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
          <Text style={styles.resetText}>Réinitialiser les valeurs par défaut</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.background },
  content:    { padding: 16, gap: 12 },
  card:       { backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardSub:    { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
  currentVal: { fontSize: 22, fontWeight: '700', color: Colors.onSurface, textAlign: 'center', paddingVertical: 4 },
  pills:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceContainerHigh, borderWidth: 1, borderColor: Colors.outlineVariant + '60' },
  pillActive: { backgroundColor: Colors.primaryContainer, borderColor: Colors.primary },
  pillText:   { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  pillTextActive: { color: Colors.onPrimaryContainer, fontWeight: '700' },
  savedMsg:   { textAlign: 'center', color: Colors.secondary, fontSize: 13, padding: 10 },
  btn:        { marginTop: 4 },
  resetBtn:   { alignItems: 'center', padding: 12 },
  resetText:  { fontSize: 13, color: Colors.onSurfaceVariant, textDecorationLine: 'underline' },
});
