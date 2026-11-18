import { useWeight } from '@/hooks/useWeight';
import { useTranslation } from '@/i18n';
import { StyleSheet, Text, View } from 'react-native';

import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { usePreviousPerformance } from '@/features/exercises/hooks/usePreviousPerformance';

interface PreviousPerformanceProps {
  exerciseId: string;
}

export function PreviousPerformance({ exerciseId }: PreviousPerformanceProps) {
  const { t } = useTranslation();
  const { formatSet } = useWeight();
  const { styles } = useThemedStyles(createStyles);
  const { sets } = usePreviousPerformance(exerciseId);

  if (sets.length === 0) {
    return <Text style={styles.muted}>{t('Anterior: aun no hay series completadas')}</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{t('Anterior')}</Text>
      {sets.map((set) => (
        <Text key={`${set.performedAt}-${set.setNumber}`} style={styles.muted}>
          {formatSet(exerciseId, set)}
        </Text>
      ))}
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
      fontWeight: '800',
    },
    muted: {
      color: colors.textMuted,
      fontSize: 13,
    },
  });
