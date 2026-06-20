import { create } from 'zustand';
import type { Toast } from '../types';

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  addToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) =>
    set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
