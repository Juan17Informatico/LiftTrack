import { TextInput, TextInputProps, StyleSheet, Text, View } from 'react-native';

import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';

interface FormTextInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormTextInput({ label, error, style, ...props }: FormTextInputProps) {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        selectionColor={colors.primary}
        {...props}
      />
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.xs,
    },
    label: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    input: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      minHeight: 46,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    error: {
      color: colors.danger,
      fontSize: 12,
    },
  });
