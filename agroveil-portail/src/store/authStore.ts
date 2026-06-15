import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Farmer } from '../types';

interface AuthStore {
  farmer: Farmer | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (farmer: Farmer, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      farmer: null,
      token: null,
      isAuthenticated: false,
      setAuth: (farmer, token) => set({ farmer, token, isAuthenticated: true }),
      clearAuth: () => set({ farmer: null, token: null, isAuthenticated: false }),
    }),
    { name: 'agroveil_auth' }
  )
);
