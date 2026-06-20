import React, { useEffect, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { GreenButton } from '../../components/ui/GreenButton';
import { authApi } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage, StorageKeys } from '../../services/offline/LocalStorage';
import { MOCK_MODE } from '../../constants/api';
import type { User } from '../../types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const COUNTRY_CODES = [
  { code: '+242', flag: '🇨🇬', name: 'Congo',         iso: 'CG' },
  { code: '+243', flag: '🇨🇩', name: 'RD Congo',      iso: 'CD' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", iso: 'CI' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal',       iso: 'SN' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun',      iso: 'CM' },
  { code: '+223', flag: '🇲🇱', name: 'Mali',          iso: 'ML' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', iso: 'BF' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin',        iso: 'BJ' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana',         iso: 'GH' },
];

type LoginMode = 'phone' | 'email';

export default function LoginScreen() {
  const [mode,       setMode]       = useState<LoginMode>('phone');
  const [phone,      setPhone]      = useState('');
  const [countryIdx, setCountryIdx] = useState(0);
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const country  = COUNTRY_CODES[countryIdx];
  const setUser  = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  const [, googleResp, googlePrompt] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID || '',
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (!googleResp) return;
    if (googleResp.type === 'error') { setError('Connexion Google échouée. Réessayez.'); return; }
    if (googleResp.type !== 'success') return;

    const idToken = googleResp.authentication?.idToken;
    if (!idToken) { setError('Token Google manquant. Réessayez.'); return; }

    setLoading(true);
    setError('');
    authApi.loginWithGoogle(idToken)
      .then((res) => {
        const { token, farmer } = res.data;
        LocalStorage.set(StorageKeys.AUTH_TOKEN, token);
        LocalStorage.set(StorageKeys.AUTH_USER, farmer);
        setUser(farmer);
        setToken(token);
        router.replace('/(tabs)');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Connexion Google échouée.'))
      .finally(() => setLoading(false));
  }, [googleResp, setUser, setToken]);

  function switchMode(m: LoginMode) { setMode(m); setError(''); }

  // ── Phone + OTP ───────────────────────────────────────────────────────────────
  async function handleSendOtp() {
    if (phone.length < 6) { setError('Numéro invalide'); return; }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `${country.code}${phone.replace(/\s/g, '')}`;
      if (!MOCK_MODE) await authApi.requestOtp(fullPhone);
      router.push({ pathname: '/(auth)/verify', params: { phone: fullPhone } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  // ── Email + Password ──────────────────────────────────────────────────────────
  async function handleEmailLogin() {
    if (!email.trim() || !password) { setError('Email et mot de passe requis'); return; }
    setError('');
    setLoading(true);
    try {
      if (MOCK_MODE) {
        const mockUser: User = {
          id: 'u1', phone: '', full_name: 'Fermier Demo', first_name: 'Fermier',
          country: 'CG', language: 'fr', created_at: new Date().toISOString(),
        };
        LocalStorage.set(StorageKeys.AUTH_TOKEN, 'mock-token');
        LocalStorage.set(StorageKeys.AUTH_USER, mockUser);
        setUser(mockUser);
        setToken('mock-token');
      } else {
        const res = await authApi.loginWithEmail(email.trim(), password);
        const { token, farmer } = res.data;
        LocalStorage.set(StorageKeys.AUTH_TOKEN, token);
        LocalStorage.set(StorageKeys.AUTH_USER, farmer);
        setUser(farmer);
        setToken(token);
      }
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGooglePress() {
    if (!GOOGLE_CLIENT_ID) {
      setError('Connexion Google non configurée. Utilisez email ou téléphone.');
      return;
    }
    setError('');
    await googlePrompt?.();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <Image
            source={require('../../assets/logo_aviora.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Aviora</Text>
          <Text style={styles.subtitle}>Surveillance avicole intelligente</Text>

          {/* Google button */}
          <TouchableOpacity
            style={[styles.googleBtn, loading && styles.googleBtnDisabled]}
            onPress={handleGooglePress}
            disabled={loading}
            activeOpacity={0.85}
          >
            <GoogleLogo />
            <Text style={styles.googleBtnText}>Continuer avec Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Mode tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'phone' && styles.tabActive]}
              onPress={() => switchMode('phone')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'phone' && styles.tabTextActive]}>
                📱 Téléphone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'email' && styles.tabActive]}
              onPress={() => switchMode('email')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'email' && styles.tabTextActive]}>
                ✉️ Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && <Text style={styles.error}>{error}</Text>}

          {/* ── PHONE MODE ───────────────────────────────────────────────────── */}
          {mode === 'phone' && (
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
              <GreenButton
                label="Recevoir mon code"
                onPress={handleSendOtp}
                loading={loading}
                style={styles.btn}
              />
              <Text style={styles.hint}>Un code à 6 chiffres sera envoyé par SMS</Text>
            </View>
          )}

          {/* ── EMAIL MODE ───────────────────────────────────────────────────── */}
          {mode === 'email' && (
            <View style={styles.form}>
              <Text style={styles.label}>Adresse email</Text>
              <TextInput
                style={styles.inputFull}
                placeholder="vous@exemple.com"
                placeholderTextColor={Colors.onSurfaceVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={[styles.label, { marginTop: 8 }]}>Mot de passe</Text>
              <View style={styles.pwRow}>
                <TextInput
                  style={[styles.inputFull, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.onSurfaceVariant}
                  secureTextEntry={!showPw}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <GreenButton
                label="Se connecter"
                onPress={handleEmailLogin}
                loading={loading}
                style={styles.btn}
              />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Créer un compte gratuitement</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.32-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.68 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.34-5.7z" />
      <Path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.34 5.7z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.background },
  kav:             { flex: 1 },
  content:         { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 48, gap: 8 },
  logo:            { width: 120, height: 80, marginBottom: 4 },
  title:           { fontSize: 32, fontWeight: '700', color: Colors.primary, letterSpacing: -0.5 },
  subtitle:        { fontSize: 15, color: Colors.onSurfaceVariant, marginBottom: 16 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, backgroundColor: '#ffffff', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 20, width: '100%',
    borderWidth: 1, borderColor: '#dadce0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2,
  },
  googleBtnDisabled: { opacity: 0.55 },
  googleBtnText:   { fontSize: 15, fontWeight: '600', color: '#3c4043' },
  divider:         { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginVertical: 4 },
  dividerLine:     { flex: 1, height: 1, backgroundColor: Colors.outlineVariant + '60' },
  dividerText:     { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '500' },
  tabs:            { flexDirection: 'row', backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 4, width: '100%', gap: 4 },
  tab:             { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive:       { backgroundColor: Colors.primaryContainer },
  tabText:         { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  tabTextActive:   { color: Colors.onPrimaryContainer },
  error:           { color: Colors.error, fontSize: 12, alignSelf: 'flex-start', marginTop: 4 },
  form:            { width: '100%', gap: 12, marginTop: 8 },
  label:           { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  inputRow:        { flexDirection: 'row', gap: 8 },
  countryBtn:      { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, justifyContent: 'center' },
  countryText:     { fontSize: 14, color: Colors.onSurface, fontWeight: '500' },
  input:           { flex: 1, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.onSurface, fontSize: 16 },
  inputFull:       { width: '100%', backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.onSurface, fontSize: 16 },
  pwRow:           { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn:          { backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 14 },
  eyeText:         { fontSize: 18 },
  btn:             { marginTop: 8 },
  hint:            { fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center' },
  footer:          { marginTop: 32, alignItems: 'center', gap: 8 },
  footerText:      { fontSize: 13, color: Colors.onSurfaceVariant },
  registerLink:    { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
