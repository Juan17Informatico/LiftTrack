import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';

export function Card({ children }: PropsWithChildren) {
  const { styles } = useThemedStyles(createStyles);
  return <View style={styles.card}>{children}</View>;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      gap: spacing.md,
      padding: spacing.lg,
    },
  });
