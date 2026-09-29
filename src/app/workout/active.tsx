import { dialogs } from '@/store/dialogStore';
import { router } from 'expo-router';
import { Plus, TimerReset, Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { IconButton } from '@/components/IconButton';
import { useRepositories } from '@/hooks/useRepositories';
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
  const { workouts } = useRepositories();

  async function safeAddSet(workoutExerciseId: string) {
    try {
      await addSet(workoutExerciseId);
    } catch (caughtError) {
      dialogs.alert('No se pudo agregar la serie', getErrorMessage(caughtError));
    }
  }

  async function safeDeleteSet(setId: string) {
    dialogs.confirm({ title: '¿Eliminar esta serie?', message: 'Se quitarán el peso y las repeticiones de esta serie.', confirmLabel: 'Eliminar serie', onConfirm: () => deleteSet(setId) });
  }

  async function safeAddExercise(exerciseId: string) {
    try {
      await addExercise(exerciseId);
    } catch (caughtError) {
      dialogs.alert('No se pudo agregar el ejercicio', getErrorMessage(caughtError));
    }
  }

  function confirmFinish() {
    dialogs.confirm({
      title: 'Un entrenamiento más. Un paso adelante.',
      message: 'Guarda esta sesión en tu historial para consultar tus series y seguir tu progreso.',
      tone: 'success', confirmLabel: 'Finalizar y guardar',
      onConfirm: async () => {
        const finished = await finish();
        if (finished) {
          timer.cancel();
          router.replace({ pathname: '/workout/[id]', params: { id: finished.id } });
        }
      },
    });
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
                <IconButton accessibilityLabel={`Quitar ${workoutExercise.exercise?.name ?? 'ejercicio'}`} icon={<Trash2 size={18} color={colors.danger} />}
                  onPress={() => dialogs.confirm({ title: '¿Quitar este ejercicio?', message: 'Se quitará de este entrenamiento junto con sus series. Permanecerá en el catálogo.', confirmLabel: 'Quitar ejercicio', onConfirm: () => workouts.removeExercise(workoutExercise.id) })} />
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
                      key={set.id}
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
      <AppButton label="Crear un ejercicio nuevo" variant="secondary" icon={<Plus size={18} color={colors.text} />}
        onPress={() => router.push({ pathname: '/exercise/create', params: { returnTo: 'previous' } })} />
      <AppButton label="Descartar entrenamiento" variant="ghost" icon={<Trash2 size={18} color={colors.danger} />}
        onPress={() => dialogs.confirm({ title: '¿Descartar esta sesión?', message: 'Se eliminará el entrenamiento en curso y sus series. No aparecerá en tu historial.', confirmLabel: 'Descartar entrenamiento',
          onConfirm: async () => { await workouts.deleteSession(session.id); timer.cancel(); router.replace('/'); },
        })} />
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
