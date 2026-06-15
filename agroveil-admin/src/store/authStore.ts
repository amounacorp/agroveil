import { create } from 'zustand';
import type { AdminUser } from '../types';
import { AUTH_TOKEN_KEY } from '../utils/constants';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),

  setAuth: (user, token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
