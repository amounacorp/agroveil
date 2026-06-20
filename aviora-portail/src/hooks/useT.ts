import { useSettingsStore } from '../store/settingsStore';
import { translations } from '../i18n/translations';

export function useT() {
  const lang = useSettingsStore((s) => s.lang);
  return translations[lang];
}
