import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang, Currency } from '../i18n/translations';

interface SettingsState {
  lang: Lang;
  currency: Currency;
  setLang: (lang: Lang) => void;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      lang: 'fr',
      currency: 'XAF',
      setLang: (lang) => set({ lang }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: 'Aviora_admin_settings' }
  )
);
