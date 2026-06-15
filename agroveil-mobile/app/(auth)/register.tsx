import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { GreenButton } from '../../components/ui/GreenButton';
import { authApi } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage, StorageKeys } from '../../services/offline/LocalStorage';
import { MOCK_MODE } from '../../constants/api';
import type { User } from '../../types';

const COUNTRIES = [
  { code: '+242', flag: '🇨🇬', name: 'Congo',         iso: 'CG' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo',      iso: 'CD' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", iso: 'CI' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal',       iso: 'SN' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun',      iso: 'CM' },
  { code: '+223', flag: '🇲🇱', name: 'Mali',           iso: 'ML' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso',  iso: 'BF' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin',         iso: 'BJ' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana',          iso: 'GH' },
];

export default function RegisterScreen() {
  const [fullName,     setFullName]     = useState('');
  const [countryIdx,   setCountryIdx]   = useState(0);
  const [showCountry,  setShowCountry]  = useState(false);
  const [phone,        setPhone]        = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const country = COUNTRIES[countryIdx];
  const setUser  = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  async function handleRegister() {
    if (!fullName.trim()) { setError('Nom complet requis'); return; }
    const hasPhone = phone.trim().replace(/\D/g, '').length > 4;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!hasPhone && !hasEmail) { setError('Entrez votre téléphone ou votre email'); return; }
    if (!password || password.length < 6) { setError('Mot de passe : minimum 6 caractères'); return; }

    setError('');
    setLoading(true);
    try {
      if (MOCK_MODE) {
        const mockUser: User = {
          id: `u-${Date.now()}`,
          phone: hasPhone ? `${country.code}${phone}` : '',
          full_name: fullName.trim(),
          first_name: fullName.trim().split(' ')[0],
          email: hasEmail ? email.trim() : undefined,
          country: country.iso,
          language: 'fr',
          created_at: new Date().toISOString(),
        };
        LocalStorage.set(StorageKeys.AUTH_TOKEN, 'mock-token-new');
        LocalStorage.set(StorageKeys.AUTH_USER, mockUser);
        setUser(mockUser);
        setToken('mock-token-new');
      } else {
        const req = {
          full_name: fullName.trim(),
          country: country.iso,
          password,
          ...(hasPhone ? { phone: `${country.code}${phone.replace(/\s/g, '')}` } : {}),
          ...(hasEmail ? { email: email.trim() } : {}),
        };
        const res = await authApi.register(req);
        const { token, farmer } = res.data;
        LocalStorage.set(StorageKeys.AUTH_TOKEN, token);
        LocalStorage.set(StorageKeys.AUTH_USER, farmer);
        setUser(farmer);
        setToken(token);
      }
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez AgroVeil gratuitement</Text>

          {/* Free plan banner */}
          <View style={styles.planBanner}>
            <Text style={styles.planText}>🌱 Compte créé en plan GRATUIT — 1 caméra, 7j d'historique</Text>
          </View>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Nom complet */}
          <View style={styles.field}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Jean Mbemba"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Pays */}
          <View style={styles.field}>
            <Text style={styles.label}>Pays</Text>
            <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountry(true)} activeOpacity={0.8}>
              <Text style={styles.countrySelectorText}>{country.flag}  {country.name}</Text>
              <Text style={styles.countrySelectorArrow}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Téléphone (optionnel) */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Téléphone <Text style={styles.optional}>(optionnel)</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{country.code}</Text>
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="0X XX XX XX"
                placeholderTextColor={Colors.onSurfaceVariant}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={12}
              />
            </View>
          </View>

          {/* Email (optionnel) */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Email <Text style={styles.optional}>(optionnel)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="vous@exemple.com"
              placeholderTextColor={Colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Mot de passe */}
          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Minimum 6 caractères"
                placeholderTextColor={Colors.onSurfaceVariant}
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <GreenButton
            label="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country picker modal */}
      <Modal visible={showCountry} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCountry(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Choisir un pays</Text>
            <ScrollView>
              {COUNTRIES.map((c, i) => (
                <TouchableOpacity
                  key={c.iso}
                  style={[styles.countryItem, i === countryIdx && styles.countryItemActive]}
                  onPress={() => { setCountryIdx(i); setShowCountry(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryItemText}>{c.flag}  {c.name}</Text>
                  <Text style={styles.countryItemCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:                { flex: 1, backgroundColor: Colors.background },
  kav:                 { flex: 1 },
  content:             { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 0 },
  back:                { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 8 },
  backText:            { color: Colors.primary, fontSize: 14 },
  title:               { fontSize: 28, fontWeight: '700', color: Colors.onSurface, marginBottom: 4 },
  subtitle:            { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 16 },
  planBanner:          { backgroundColor: Colors.primaryContainer, borderRadius: 10, padding: 12, marginBottom: 16 },
  planText:            { fontSize: 13, color: Colors.onPrimaryContainer, fontWeight: '500' },
  error:               { color: Colors.error, fontSize: 12, marginBottom: 8 },
  field:               { marginBottom: 14 },
  label:               { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500', marginBottom: 6 },
  optional:            { fontWeight: '400', color: Colors.outlineVariant },
  inputRow:            { flexDirection: 'row', gap: 8 },
  codeBox:             { backgroundColor: Colors.surfaceContainerHighest, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, justifyContent: 'center' },
  codeText:            { fontSize: 14, color: Colors.onSurface, fontWeight: '600' },
  input:               { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.onSurface, fontSize: 16 },
  pwRow:               { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn:              { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14 },
  eyeText:             { fontSize: 18 },
  countrySelector:     { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countrySelectorText: { fontSize: 15, color: Colors.onSurface },
  countrySelectorArrow:{ fontSize: 16, color: Colors.onSurfaceVariant },
  btn:                 { marginTop: 8, marginBottom: 16 },
  loginLink:           { alignItems: 'center', paddingVertical: 8 },
  loginLinkText:       { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  // Modal
  modalOverlay:        { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalSheet:          { backgroundColor: Colors.surfaceContainer, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '70%' },
  modalTitle:          { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 16 },
  countryItem:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant + '40' },
  countryItemActive:   { backgroundColor: Colors.primaryContainer + '60', borderRadius: 8 },
  countryItemText:     { fontSize: 15, color: Colors.onSurface },
  countryItemCode:     { fontSize: 13, color: Colors.onSurfaceVariant },
});
