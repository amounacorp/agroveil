import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { LocalStorage, StorageKeys } from '../services/offline/LocalStorage';
import type { User } from '../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const { token, setUser, setToken } = useAuthStore();
  const segments = useSegments();
  const router   = useRouter();

  // Rehydrate auth from persistent storage on app launch
  useEffect(() => {
    const storedToken = LocalStorage.get<string>(StorageKeys.AUTH_TOKEN);
    const storedUser  = LocalStorage.get<User>(StorageKeys.AUTH_USER);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, [setToken, setUser]);

  // Navigate based on auth state
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="alert/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile/edit" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/notifications" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/cameras" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/ai-params" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/sync" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings/help" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
