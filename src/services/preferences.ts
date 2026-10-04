import Storage from 'expo-sqlite/kv-store';

import type { WeightUnit } from '@/types/domain';

const UNIT_KEY = 'weightUnit';
const THEME_KEY = 'themePreference';
const LANGUAGE_KEY = 'appLanguage';

export type ThemePreference = 'system' | 'dark' | 'light';
export type AppLanguage = 'es' | 'en';

export const preferences = {
  async load(): Promise<{ unit: WeightUnit; theme: ThemePreference; language: AppLanguage }> {
    // Open the web worker asynchronously before any synchronous preference access.
    const unit = await Storage.getItemAsync(UNIT_KEY);
    const theme = await Storage.getItemAsync(THEME_KEY);
    const language = await Storage.getItemAsync(LANGUAGE_KEY);
    return {
      unit: unit === 'lb' ? 'lb' : 'kg',
      theme: theme === 'dark' || theme === 'light' ? theme : 'system',
      language: language === 'en' ? 'en' : 'es',
    };
  },

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
    return Storage.getItemSync(LANGUAGE_KEY) === 'en' ? 'en' : 'es';
  },

  setAppLanguage(language: AppLanguage): void {
    Storage.setItemSync(LANGUAGE_KEY, language);
  },
};
