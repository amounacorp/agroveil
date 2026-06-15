import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { SettingsHeader } from '../../components/ui/SettingsHeader';
import { GreenButton } from '../../components/ui/GreenButton';
import { farmerApi } from '../../services/api/farmer';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage, StorageKeys } from '../../services/offline/LocalStorage';

const COUNTRY_LIST = [
  { label: '🇨🇬 Congo', value: 'CG' },
  { label: '🇨🇩 RD Congo', value: 'CD' },
  { label: "🇨🇮 Côte d'Ivoire", value: 'CI' },
  { label: '🇸🇳 Sénégal', value: 'SN' },
  { label: '🇨🇲 Cameroun', value: 'CM' },
  { label: '🇲🇱 Mali', value: 'ML' },
  { label: '🇧🇫 Burkina Faso', value: 'BF' },
  { label: '🇧🇯 Bénin', value: 'BJ' },
  { label: '🇬🇭 Ghana', value: 'GH' },
];

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();

  const [fullName,   setFullName]   = useState(user?.full_name ?? '');
  const [city,       setCity]       = useState(user?.city ?? '');
  const [whatsapp,   setWhatsapp]   = useState(user?.whatsapp_number ?? '');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  async function handleSave() {
    if (!fullName.trim()) { setError('Le nom complet est requis.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await farmerApi.updateMe({
        full_name: fullName.trim(),
        city: city.trim() || undefined,
        whatsapp_number: whatsapp.trim() || undefined,
      });
      const updated = res.data;
      setUser(updated);
      LocalStorage.set(StorageKeys.AUTH_USER, updated);
      setSuccess(true);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SettingsHeader title="Modifier le profil" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              📧 Email et téléphone ne peuvent pas être modifiés ici. Contactez le support pour tout changement.
            </Text>
          </View>

          {/* Read-only fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations du compte</Text>

            <View style={styles.readonlyRow}>
              <Text style={styles.readonlyLabel}>Email</Text>
              <Text style={styles.readonlyValue}>{user?.email || '—'}</Text>
            </View>
            <View style={styles.readonlyRow}>
              <Text style={styles.readonlyLabel}>Téléphone</Text>
              <Text style={styles.readonlyValue}>{user?.phone || '—'}</Text>
            </View>
            <View style={styles.readonlyRow}>
              <Text style={styles.readonlyLabel}>Pays</Text>
              <Text style={styles.readonlyValue}>{COUNTRY_LIST.find((c) => c.value === user?.country)?.label ?? user?.country ?? '—'}</Text>
            </View>
          </View>

          {/* Editable fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations modifiables</Text>

            <Text style={styles.label}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Votre nom complet"
              placeholderTextColor={Colors.onSurfaceVariant}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Votre ville (optionnel)"
              placeholderTextColor={Colors.onSurfaceVariant}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Numéro WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="+242 XX XXX XXXX"
              placeholderTextColor={Colors.onSurfaceVariant}
              keyboardType="phone-pad"
            />
            <Text style={styles.hint}>Utilisé pour recevoir les alertes WhatsApp</Text>
          </View>

          {/* Error / success */}
          {!!error   && <Text style={styles.error}>{error}</Text>}
          {!!success && <Text style={styles.successMsg}>✅ Profil mis à jour !</Text>}

          <GreenButton label="Enregistrer les modifications" onPress={handleSave} loading={loading} style={styles.btn} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  content:      { padding: 16, gap: 16 },
  infoBanner:   { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: Colors.tertiary },
  infoText:     { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 18 },
  section:      { backgroundColor: Colors.surfaceContainer, borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.outlineVariant + '40' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  readonlyRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '30' },
  readonlyLabel:{ fontSize: 13, color: Colors.onSurfaceVariant },
  readonlyValue:{ fontSize: 13, color: Colors.onSurface, fontWeight: '500' },
  label:        { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  input:        { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, color: Colors.onSurface, fontSize: 15, borderWidth: 1, borderColor: Colors.outlineVariant + '50' },
  hint:         { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: -4 },
  error:        { color: Colors.error, fontSize: 13, textAlign: 'center', backgroundColor: Colors.errorContainer + '30', padding: 10, borderRadius: 8 },
  successMsg:   { color: Colors.secondary, fontSize: 13, textAlign: 'center', backgroundColor: Colors.primaryContainer + '40', padding: 10, borderRadius: 8 },
  btn:          { marginTop: 8 },
});
