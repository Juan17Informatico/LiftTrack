import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';

export function LoadingState({ label = 'Cargando' }: { label?: string }) {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.label}>{t(label)}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.md,
      justifyContent: 'center',
      padding: spacing.xl,
    },
    label: {
      color: colors.textMuted,
      fontSize: 14,
    },
  });
