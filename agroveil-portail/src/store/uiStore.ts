import type { ReactNode } from 'react';
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIStore {
  toasts: Toast[];
  isModalOpen: boolean;
  modalContent: ReactNode | null;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  isModalOpen: false,
  modalContent: null,
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}));
