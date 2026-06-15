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
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alert/[id]"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
