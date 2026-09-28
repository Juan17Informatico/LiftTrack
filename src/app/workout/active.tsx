import { router } from 'expo-router';
import { Plus, TimerReset } from 'lucide-react-native';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { PreviousPerformance } from '@/features/workouts/components/PreviousPerformance';
import { WorkoutSetRow } from '@/features/workouts/components/WorkoutSetRow';
import { useActiveWorkoutSession } from '@/features/workouts/hooks/useActiveWorkoutSession';
import { useRestTimer } from '@/hooks/useRestTimer';
import { formatDateTime, formatTimer } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function ActiveWorkoutScreen() {
  const { session, loading, error, addSet, updateSet, deleteSet, addExercise, finish } =
    useActiveWorkoutSession();
  const { exercises } = useExerciseCatalog();
  const timer = useRestTimer();

  async function safeAddSet(workoutExerciseId: string) {
    try {
      await addSet(workoutExerciseId);
    } catch (caughtError) {
      Alert.alert('No se pudo agregar la serie', getErrorMessage(caughtError));
    }
  }

  async function safeDeleteSet(setId: string) {
    try {
      await deleteSet(setId);
    } catch (caughtError) {
      Alert.alert('No se pudo eliminar la serie', getErrorMessage(caughtError));
    }
  }

  async function safeAddExercise(exerciseId: string) {
    try {
      await addExercise(exerciseId);
    } catch (caughtError) {
      Alert.alert('No se pudo agregar el ejercicio', getErrorMessage(caughtError));
    }
  }

  function confirmFinish() {
    Alert.alert('Finalizar entrenamiento?', 'La sesion pasara al historial.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'default',
        onPress: async () => {
          try {
            const finished = await finish();
            if (finished) {
              router.replace({ pathname: '/workout/[id]', params: { id: finished.id } });
            }
          } catch (caughtError) {
            Alert.alert('No se pudo finalizar el entrenamiento', getErrorMessage(caughtError));
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <Screen title="Entrenamiento activo">
        <LoadingState label="Cargando entrenamiento activo" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Entrenamiento activo">
        <EmptyState title="Entrenamiento no disponible" message={error} />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen title="Entrenamiento activo">
        <EmptyState
          title="No hay entrenamiento activo"
          message="Empieza desde una rutina o abre un entrenamiento libre."
          action={<AppButton label="Ir a rutinas" onPress={() => router.push('/routines')} />}
        />
      </Screen>
    );
  }

  const activeExerciseIds = new Set(session.exercises.map((exercise) => exercise.exerciseId));
  const availableExercises = exercises.filter((exercise) => !activeExerciseIds.has(exercise.id));

  return (
    <Screen
      title={session.name}
      subtitle={`Inicio: ${formatDateTime(session.startedAt)}`}
      right={<AppButton label="Finalizar" onPress={confirmFinish} />}
    >
      <Card>
        <View style={styles.timerHeader}>
          <View>
            <Text style={styles.sectionTitle}>Temporizador de descanso</Text>
            <Text style={styles.timer}>{formatTimer(timer.remainingSeconds)}</Text>
          </View>
          <TimerReset color={colors.primary} size={28} />
        </View>
        <View style={styles.row}>
          <AppButton label="90s" onPress={() => timer.start(90)} />
          <AppButton label="2m" variant="secondary" onPress={() => timer.start(120)} />
          <AppButton
            label={timer.status === 'running' ? 'Pausar' : 'Reiniciar'}
            variant="secondary"
            onPress={() => (timer.status === 'running' ? timer.pause() : timer.start(timer.durationSeconds))}
          />
          <AppButton label="Cancelar" variant="ghost" onPress={timer.cancel} />
        </View>
      </Card>

      {session.exercises.length === 0 ? (
        <EmptyState title="No hay ejercicios" message="Agrega un ejercicio para registrar series." />
      ) : (
        <View style={styles.stack}>
          {session.exercises.map((workoutExercise) => (
            <Card key={workoutExercise.id}>
              <View style={styles.exerciseHeader}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({
                      pathname: '/exercise/[id]',
                      params: { id: workoutExercise.exerciseId },
                    })
                  }
                  style={styles.flex}
                >
                  <Text style={styles.exerciseName}>{workoutExercise.exercise?.name}</Text>
                  <Text style={styles.muted}>
                    {translateMuscleGroup(workoutExercise.exercise?.muscleGroup)}
                  </Text>
                </TouchableOpacity>
                <AppButton
                  icon={<Plus color={colors.ink} size={16} />}
                  label="Serie"
                  onPress={() => safeAddSet(workoutExercise.id)}
                />
              </View>
              <PreviousPerformance exerciseId={workoutExercise.exerciseId} />
              {workoutExercise.sets.length === 0 ? (
                <Text style={styles.muted}>Aun no hay series.</Text>
              ) : (
                <View style={styles.setStack}>
                  <View style={styles.setHeader}>
                    <Text style={styles.setHeaderText}>#</Text>
                    <Text style={styles.setHeaderText}>Peso</Text>
                    <Text style={styles.setHeaderText}>Reps</Text>
                    <Text style={styles.setHeaderText}>Listo</Text>
                    <Text style={styles.setHeaderText}>Borrar</Text>
                  </View>
                  {workoutExercise.sets.map((set) => (
                    <WorkoutSetRow
                      key={`${set.id}-${set.updatedAt}`}
                      set={set}
                      onDelete={safeDeleteSet}
                      onUpdate={updateSet}
                    />
                  ))}
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Agregar ejercicio</Text>
      <View style={styles.stack}>
        {availableExercises.map((exercise) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={exercise.id}
            onPress={() => safeAddExercise(exercise.id)}
          >
            <Card>
              <View style={styles.addRow}>
                <View style={styles.flex}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.muted}>{translateMuscleGroup(exercise.muscleGroup)}</Text>
                </View>
                <Plus color={colors.primary} size={20} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      {availableExercises.length === 0 ? (
        <Text style={styles.muted}>Todos los ejercicios del catalogo ya fueron agregados.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  timerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timer: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.md,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  setStack: {
    gap: spacing.sm,
  },
  setHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  setHeaderText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
