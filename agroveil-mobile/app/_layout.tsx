import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
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
  const { setUser, setToken } = useAuthStore();

  // Rehydrate auth from persistent storage on app launch
  useEffect(() => {
    const token = LocalStorage.get<string>(StorageKeys.AUTH_TOKEN);
    const user  = LocalStorage.get<User>(StorageKeys.AUTH_USER);
    if (token && user) {
      setToken(token);
      setUser(user);
    }
  }, [setToken, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#131313" />
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
