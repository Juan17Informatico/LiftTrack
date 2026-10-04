import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';
import { usePreferencesStore } from '@/store/preferencesStore';

export function useTheme() {
  const preference = usePreferencesStore((state) => state.theme);
  const system = useColorScheme();
  const dark = (preference === 'system' ? system : preference) === 'dark';
  return { colors: dark ? darkColors : lightColors, dark };
}

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T) {
  const { colors, dark } = useTheme();
  const styles = useMemo(() => factory(colors), [colors, factory]);
  return { colors, styles, dark };
}
