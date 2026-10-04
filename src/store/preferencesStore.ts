import { create } from 'zustand';

import { preferences, type AppLanguage, type ThemePreference } from '@/services/preferences';
import type { WeightUnit } from '@/types/domain';

interface PreferencesState {
  unit: WeightUnit;
  theme: ThemePreference;
  language: AppLanguage;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setUnit: (unit: WeightUnit) => void;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: AppLanguage) => void;
}

// Persist before publishing so a failed write never leaves a misleading selection.
let hydration: Promise<void> | undefined;
export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  unit: 'kg',
  theme: 'system',
  language: 'es',
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return Promise.resolve();
    hydration ??= preferences
      .load()
      .then((values) => {
        set({ ...values, hydrated: true });
      })
      .finally(() => {
        hydration = undefined;
      });
    return hydration;
  },
  setUnit: (unit) => {
    preferences.setWeightUnit(unit);
    set({ unit });
  },
  setTheme: (theme) => {
    preferences.setThemePreference(theme);
    set({ theme });
  },
  setLanguage: (language) => {
    preferences.setAppLanguage(language);
    set({ language });
  },
}));
