import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { GreenButton } from '../../components/ui/GreenButton';
import { authApi } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import { LocalStorage, StorageKeys } from '../../services/offline/LocalStorage';
import { MOCK_MODE } from '../../constants/api';
import type { User } from '../../types';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [digits,  setDigits]  = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const refs = useRef<(TextInput | null)[]>(Array(6).fill(null));
  const setUser  = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  function handleDigit(value: string, index: number) {
    const d = [...digits];
    d[index] = value.slice(-1);
    setDigits(d);
    if (value && index < 5) refs.current[index + 1]?.focus();
  }

  function handleBackspace(index: number) {
    if (!digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const d = [...digits]; d[index - 1] = ''; setDigits(d);
    }
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length !== 6) { setError('Code incomplet'); return; }
    setError('');
    setLoading(true);
    try {
      if (MOCK_MODE) {
        const mockUser: User = {
          id: 'u1',
          phone: phone ?? '',
          full_name: 'Fermier Demo',
          first_name: 'Fermier',
          country: 'CG',
          language: 'fr',
          created_at: new Date().toISOString(),
        };
        LocalStorage.set(StorageKeys.AUTH_TOKEN, 'mock-token');
        LocalStorage.set(StorageKeys.AUTH_USER, mockUser);
        setUser(mockUser);
        setToken('mock-token');
      } else {
        const res = await authApi.verifyOtp(phone ?? '', code);
        const { token, farmer } = res.data;
        LocalStorage.set(StorageKeys.AUTH_TOKEN, token);
        LocalStorage.set(StorageKeys.AUTH_USER, farmer);
        setUser(farmer);
        setToken(token);
      }
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code incorrect. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>Code envoyé au {phone}</Text>

          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                style={[styles.otpBox, d && styles.otpBoxFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={d}
                onChangeText={(v) => handleDigit(v, i)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') handleBackspace(i);
                }}
                caretHidden
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <GreenButton label="Confirmer" onPress={handleVerify} loading={loading} style={styles.btn} />

          <Text style={styles.hint}>
            {MOCK_MODE ? 'MODE DÉMO — entrez n\'importe quel code à 6 chiffres' : 'Le code expire dans 10 minutes'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  kav:          { flex: 1 },
  content:      { flex: 1, paddingHorizontal: 24, paddingTop: 16, gap: 12 },
  back:         { alignSelf: 'flex-start', paddingVertical: 8 },
  backText:     { color: Colors.primary, fontSize: 14 },
  title:        { fontSize: 28, fontWeight: '700', color: Colors.onSurface, marginTop: 24 },
  subtitle:     { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 24 },
  otpRow:       { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  otpBox:       { width: 48, height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.outlineVariant, backgroundColor: Colors.surfaceContainerHigh, textAlign: 'center', fontSize: 22, fontWeight: '700', color: Colors.onSurface },
  otpBoxFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  error:        { color: Colors.error, fontSize: 12, textAlign: 'center' },
  btn:          { marginTop: 8 },
  hint:         { fontSize: 12, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 12 },
});
