import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { colors, spacing } from '@/constants/theme';
import type { WorkoutSessionDetail } from '@/types/domain';

interface WorkoutSessionSummaryProps {
  session: WorkoutSessionDetail;
}

export function WorkoutSessionSummary({ session }: WorkoutSessionSummaryProps) {
  return (
    <View style={styles.wrapper}>
      {session.exercises.map((workoutExercise) => (
        <Card key={workoutExercise.id}>
          <View style={styles.header}>
            <Text style={styles.exerciseName}>{workoutExercise.exercise?.name ?? 'Ejercicio'}</Text>
            <Text style={styles.muted}>{workoutExercise.sets.length} series</Text>
          </View>
          {workoutExercise.sets.map((set) => (
            <View key={set.id} style={styles.setRow}>
              <Text style={styles.muted}>Serie {set.setNumber}</Text>
              <Text style={styles.setValue}>
                {set.weight ?? '-'} kg x {set.repetitions ?? '-'}
              </Text>
              <Text style={set.completed ? styles.done : styles.muted}>
                {set.completed ? 'Completada' : 'Abierta'}
              </Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseName: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  setValue: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  done: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
});
