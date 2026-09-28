import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useExerciseDetail } from '@/features/exercises/hooks/useExerciseDetail';
import { formatDateTime } from '@/utils/date';
import {
  translateEquipment,
  translateMuscleGroup,
  translateMuscleGroups,
} from '@/utils/exerciseMetadata';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, previousSets, loading, error } = useExerciseDetail(id);

  if (loading) {
    return (
      <Screen title="Ejercicio">
        <LoadingState label="Cargando ejercicio" />
      </Screen>
    );
  }

  if (error || !exercise) {
    return (
      <Screen title="Ejercicio">
        <EmptyState title="Ejercicio no encontrado" message={error ?? 'Este ejercicio no esta disponible.'} />
      </Screen>
    );
  }

  return (
    <Screen title={exercise.name} subtitle={translateMuscleGroup(exercise.muscleGroup)}>
      <Card>
        <Text style={styles.title}>Detalles</Text>
        <Text style={styles.muted}>Equipo: {translateEquipment(exercise.equipment)}</Text>
        {exercise.secondaryMuscles.length > 0 ? (
          <Text style={styles.muted}>Secundarios: {translateMuscleGroups(exercise.secondaryMuscles)}</Text>
        ) : null}
        {exercise.instructions ? <Text style={styles.body}>{exercise.instructions}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.title}>Ultimo rendimiento</Text>
        {previousSets.length === 0 ? (
          <Text style={styles.muted}>Aun no hay series completadas.</Text>
        ) : (
          <View style={styles.stack}>
            <Text style={styles.muted}>{formatDateTime(previousSets[0].performedAt)}</Text>
            {previousSets.map((set) => (
              <View key={`${set.performedAt}-${set.setNumber}`} style={styles.row}>
                <Text style={styles.muted}>Serie {set.setNumber}</Text>
                <Text style={styles.value}>
                  {set.weight ?? '-'} kg x {set.repetitions ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  stack: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
});
