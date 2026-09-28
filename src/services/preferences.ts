import Storage from 'expo-sqlite/kv-store';

import type { WeightUnit } from '@/types/domain';

const UNIT_KEY = 'weightUnit';
const THEME_KEY = 'themePreference';
const LANGUAGE_KEY = 'appLanguage';

export type ThemePreference = 'system' | 'dark' | 'light';
export type AppLanguage = 'es';

export const preferences = {
  getWeightUnit(): WeightUnit {
    const value = Storage.getItemSync(UNIT_KEY);
    return value === 'lb' ? 'lb' : 'kg';
  },

  setWeightUnit(unit: WeightUnit): void {
    Storage.setItemSync(UNIT_KEY, unit);
  },

  getThemePreference(): ThemePreference {
    const value = Storage.getItemSync(THEME_KEY);
    if (value === 'dark' || value === 'light') {
      return value;
    }

    return 'system';
  },

  setThemePreference(theme: ThemePreference): void {
    Storage.setItemSync(THEME_KEY, theme);
  },

  getAppLanguage(): AppLanguage {
    return 'es';
  },

  setAppLanguage(language: AppLanguage): void {
    Storage.setItemSync(LANGUAGE_KEY, language);
  },
};
