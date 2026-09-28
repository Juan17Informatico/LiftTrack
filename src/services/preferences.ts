import type { WeightUnit } from '@/types/domain';

const UNIT_KEY = 'weightUnit';
const THEME_KEY = 'themePreference';
const LANGUAGE_KEY = 'appLanguage';

export type ThemePreference = 'system' | 'dark' | 'light';
export type AppLanguage = 'es';

interface PreferenceStorage {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
}

declare const require: (moduleName: string) => unknown;

let storage: PreferenceStorage | null = null;

function getStorage(): PreferenceStorage {
  if (storage) {
    return storage;
  }

  try {
    const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
    storage = createMMKV({ id: 'lifttrack.preferences' });
  } catch (error) {
    console.warn('MMKV no esta disponible, se usaran preferencias en memoria', error);
    storage = createMemoryStorage();
  }

  return storage;
}

function createMemoryStorage(): PreferenceStorage {
  const values = new Map<string, string>();

  return {
    getString: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
    },
  };
}

export const preferences = {
  getWeightUnit(): WeightUnit {
    const value = getStorage().getString(UNIT_KEY);
    return value === 'lb' ? 'lb' : 'kg';
  },

  setWeightUnit(unit: WeightUnit): void {
    getStorage().set(UNIT_KEY, unit);
  },

  getThemePreference(): ThemePreference {
    const value = getStorage().getString(THEME_KEY);
    if (value === 'dark' || value === 'light') {
      return value;
    }

    return 'system';
  },

  setThemePreference(theme: ThemePreference): void {
    getStorage().set(THEME_KEY, theme);
  },

  getAppLanguage(): AppLanguage {
    return 'es';
  },

  setAppLanguage(language: AppLanguage): void {
    getStorage().set(LANGUAGE_KEY, language);
  },
};
