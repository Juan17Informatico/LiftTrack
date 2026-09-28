import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { usePreviousPerformance } from '@/features/exercises/hooks/usePreviousPerformance';

interface PreviousPerformanceProps {
  exerciseId: string;
}

export function PreviousPerformance({ exerciseId }: PreviousPerformanceProps) {
  const { sets } = usePreviousPerformance(exerciseId);

  if (sets.length === 0) {
    return <Text style={styles.muted}>Anterior: aun no hay series completadas</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Anterior</Text>
      {sets.map((set) => (
        <Text key={`${set.performedAt}-${set.setNumber}`} style={styles.muted}>
          {set.weight ?? '-'} kg x {set.repetitions ?? '-'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
