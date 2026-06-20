import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';
import { GreenButton } from '../../components/ui/GreenButton';
import { LocalStorage } from '../../services/offline/LocalStorage';
import { useAuthStore } from '../../store/authStore';

interface NotifSettings {
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  criticalOnly: boolean;
  whatsappNumber: string;
}

const STORAGE_KEY = 'notif_settings';

function loadSettings(defaultWhatsapp: string): NotifSettings {
  return LocalStorage.get<NotifSettings>(STORAGE_KEY) ?? {
    whatsappEnabled: true,
    pushEnabled: true,
    criticalOnly: false,
    whatsappNumber: defaultWhatsapp,
  };
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState(() => loadSettings(user?.whatsapp_number ?? ''));
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<NotifSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
    setSaved(false);
  }

  function handleSave() {
    LocalStorage.set(STORAGE_KEY, settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* WhatsApp */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🟢 WhatsApp</Text>
          <ToggleRow
            label="Alertes WhatsApp actives"
            sub="Recevez les alertes critiques sur WhatsApp"
            value={settings.whatsappEnabled}
            onChange={(v) => update({ whatsappEnabled: v })}
          />
          {settings.whatsappEnabled && (
            <>
              <View style={styles.divider} />
              <Text style={styles.fieldLabel}>Numéro WhatsApp</Text>
              <TextInput
                style={styles.input}
                value={settings.whatsappNumber}
                onChangeText={(v) => update({ whatsappNumber: v })}
                placeholder="+242 06 XXX XXXX"
                placeholderTextColor={Colors.onSurfaceVariant}
                keyboardType="phone-pad"
              />
              <Text style={styles.fieldHint}>Ce numéro recevra les alertes SMS/WhatsApp</Text>
            </>
          )}
        </View>

        {/* Push */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔔 Notifications push</Text>
          <ToggleRow
            label="Notifications push actives"
            sub="Alertes en temps réel sur votre téléphone"
            value={settings.pushEnabled}
            onChange={(v) => update({ pushEnabled: v })}
          />
        </View>

        {/* Filtre */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Filtres</Text>
          <ToggleRow
            label="Alertes critiques uniquement"
            sub="Ignorer les alertes de niveau info et avertissement"
            value={settings.criticalOnly}
            onChange={(v) => update({ criticalOnly: v })}
          />
        </View>

        {saved && <Text style={styles.savedMsg}>✅ Paramètres sauvegardés</Text>}
        <GreenButton label="Sauvegarder" onPress={handleSave} style={styles.btn} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.text}>
        <Text style={toggleStyles.label}>{label}</Text>
        <Text style={toggleStyles.sub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primaryContainer }}
        thumbColor={value ? Colors.primary : Colors.outlineVariant}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.background },
  content:    { padding: 16, gap: 12 },
  card:       { backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  divider:    { height: 1, backgroundColor: Colors.outlineVariant + '40' },
  fieldLabel: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  input:      { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: Colors.onSurface, fontSize: 15 },
  fieldHint:  { fontSize: 11, color: Colors.onSurfaceVariant },
  savedMsg:   { textAlign: 'center', color: Colors.secondary, fontSize: 13, padding: 10 },
  btn:        { marginTop: 8 },
});

const toggleStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text:  { flex: 1, gap: 2 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  sub:   { fontSize: 12, color: Colors.onSurfaceVariant },
});
