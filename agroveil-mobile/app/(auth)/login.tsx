import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { GreenButton } from '../../components/ui/GreenButton';
import { authApi } from '../../services/api/auth';
import { MOCK_MODE } from '../../constants/api';

const COUNTRY_CODES = [
  { code: '+225', flag: '🇨🇮', name: 'CI' },
  { code: '+221', flag: '🇸🇳', name: 'SN' },
  { code: '+237', flag: '🇨🇲', name: 'CM' },
  { code: '+233', flag: '🇬🇭', name: 'GH' },
  { code: '+229', flag: '🇧🇯', name: 'BJ' },
];

export default function LoginScreen() {
  const [phone,     setPhone]     = useState('');
  const [countryIdx,setCountryIdx]= useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const country = COUNTRY_CODES[countryIdx];

  async function handleSendOtp() {
    if (phone.length < 8) { setError('Numéro invalide'); return; }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `${country.code}${phone}`;
      if (!MOCK_MODE) await authApi.requestOtp(fullPhone);
      router.push({ pathname: '/(auth)/verify', params: { phone: fullPhone } });
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <View style={styles.content}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>AgroVeil</Text>
          <Text style={styles.subtitle}>Surveillance avicole intelligente</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setCountryIdx((i) => (i + 1) % COUNTRY_CODES.length)}
              >
                <Text style={styles.countryText}>{country.flag} {country.code}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="0X XX XX XX XX"
                placeholderTextColor={Colors.onSurfaceVariant}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GreenButton
              label="Recevoir mon code"
              onPress={handleSendOtp}
              loading={loading}
              style={styles.btn}
            />
          </View>

          <Text style={styles.footer}>
            Un code à 6 chiffres vous sera envoyé par SMS
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.background },
  kav:        { flex: 1 },
  content:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 8 },
  logo:       { fontSize: 56, marginBottom: 4 },
  title:      { fontSize: 32, fontWeight: '700', color: Colors.primary, letterSpacing: -0.5 },
  subtitle:   { fontSize: 15, color: Colors.onSurfaceVariant, marginBottom: 32 },
  form:       { width: '100%', gap: 12 },
  label:      { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  inputRow:   { flexDirection: 'row', gap: 8 },
  countryBtn: { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, justifyContent: 'center' },
  countryText:{ fontSize: 14, color: Colors.onSurface, fontWeight: '500' },
  input:      { flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.onSurface, fontSize: 16 },
  error:      { color: Colors.error, fontSize: 12 },
  btn:        { marginTop: 8 },
  footer:     { marginTop: 24, fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center' },
});
