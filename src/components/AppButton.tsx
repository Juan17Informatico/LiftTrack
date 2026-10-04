import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
}: AppButtonProps) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        {icon}
        <Text
          style={[
            styles.label,
            variant === 'primary'
              ? styles.primaryLabel
              : variant === 'danger'
                ? styles.dangerLabel
                : styles.defaultLabel,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: radius.md,
      minHeight: 46,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    inner: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    label: {
      fontSize: 15,
      fontWeight: '700',
    },
    primaryLabel: {
      color: colors.ink,
    },
    defaultLabel: {
      color: colors.text,
    },
    dangerLabel: { color: colors.onDanger },
    primary: {
      backgroundColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.danger,
    },
    disabled: {
      opacity: 0.45,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.99 }],
    },
  });
