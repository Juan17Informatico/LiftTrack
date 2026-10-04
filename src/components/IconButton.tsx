import { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { type ThemeColors, radius } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';

interface IconButtonProps {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function IconButton({
  accessibilityLabel,
  icon,
  onPress,
  danger = false,
  disabled = false,
}: IconButtonProps) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        danger && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radius.md,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    danger: {
      borderColor: colors.danger,
    },
    disabled: {
      opacity: 0.35,
    },
    pressed: {
      opacity: 0.75,
    },
  });
