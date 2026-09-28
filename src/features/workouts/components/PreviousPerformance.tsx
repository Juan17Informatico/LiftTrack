import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';
import { useRepositories } from '@/hooks/useRepositories';
import type { PreviousExerciseSet } from '@/types/domain';

interface PreviousPerformanceProps {
  exerciseId: string;
}

export function PreviousPerformance({ exerciseId }: PreviousPerformanceProps) {
  const { exercises } = useRepositories();
  const [sets, setSets] = useState<PreviousExerciseSet[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await exercises.findLastPerformance(exerciseId);
        if (mounted) {
          setSets(result);
        }
      } catch (error) {
        console.error('No se pudo cargar el rendimiento anterior', error);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [exerciseId, exercises]);

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
