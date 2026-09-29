import { dialogs } from '@/store/dialogStore';
import { router } from 'expo-router';
import { ArrowRight, Play, Plus } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { BrandLogo } from '@/components/BrandLogo';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { useWorkoutHistory } from '@/features/history/hooks/useWorkoutHistory';
import { useRoutines } from '@/features/routines/hooks/useRoutines';
import { useRepositories } from '@/hooks/useRepositories';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import type { RoutineSummary } from '@/types/domain';
import { formatDateTime, formatDuration } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function HomeScreen() {
  const { routines, loading: routinesLoading } = useRoutines();
  const { exercises } = useExerciseCatalog();
  const { history } = useWorkoutHistory();
  const { workouts } = useRepositories();
  const activeWorkoutId = useActiveWorkoutStore((state) => state.activeWorkoutId);
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);

  async function startEmptyWorkout() {
    try {
      const session = await workouts.startEmpty();
      setActiveWorkoutId(session.id);
      router.push('/workout/active');
    } catch (error) {
      dialogs.alert('No se pudo iniciar el entrenamiento', getErrorMessage(error));
    }
  }

  async function startRoutine(routine: RoutineSummary) {
    try {
      const session = await workouts.startFromRoutine(routine.id);
      setActiveWorkoutId(session.id);
      router.push('/workout/active');
    } catch (error) {
      dialogs.alert('No se pudo iniciar la rutina', getErrorMessage(error));
    }
  }

  const lastWorkout = history[0];

  return (
    <Screen
      title="LiftTrack"
      subtitle="Registro de entrenamientos offline-first para sesiones enfocadas."
      right={<BrandLogo />}
    >
      <Card>
        <Text style={styles.sectionTitle}>
          {activeWorkoutId ? 'Entrenamiento en curso' : 'Listo para entrenar'}
        </Text>
        <Text style={styles.muted}>
          {activeWorkoutId
            ? 'Tu entrenamiento activo esta guardado localmente y puedes retomarlo cuando quieras.'
            : 'Empieza desde una rutina o abre una sesion libre.'}
        </Text>
        <AppButton
          label={activeWorkoutId ? 'Retomar entrenamiento' : 'Iniciar libre'}
          icon={<Play color={colors.ink} size={18} />}
          onPress={() => (activeWorkoutId ? router.push('/workout/active') : startEmptyWorkout())}
        />
      </Card>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Rutinas</Text>
        <AppButton
          label="Nueva"
          icon={<Plus color={colors.ink} size={16} />}
          onPress={() => router.push('/routine/create')}
        />
      </View>

      {routinesLoading ? (
        <LoadingState label="Cargando rutinas" />
      ) : routines.length === 0 ? (
        <EmptyState
          title="Aun no hay rutinas"
          message="Crea una rutina, agrega ejercicios y empieza tu primer entrenamiento registrado."
          action={<AppButton label="Crear rutina" onPress={() => router.push('/routine/create')} />}
        />
      ) : (
        <View style={styles.stack}>
          {routines.slice(0, 4).map((routine) => (
            <TouchableOpacity
              activeOpacity={0.75}
              key={routine.id}
              onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
            >
              <Card>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{routine.name}</Text>
                    <Text style={styles.muted}>
                      {routine.exerciseCount} {routine.exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => startRoutine(routine)} style={styles.playButton}>
                    <Play color={colors.ink} size={18} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Catalogo de ejercicios</Text>
        <AppButton label="Ver todos" variant="ghost" onPress={() => router.push('/exercises')} />
      </View>
      <View style={styles.catalogGrid}>
        {exercises.slice(0, 6).map((exercise) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={exercise.id}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })}
            style={styles.catalogItem}
          >
            <Text style={styles.catalogName}>{exercise.name}</Text>
            <Text style={styles.muted}>{translateMuscleGroup(exercise.muscleGroup)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Ultimo entrenamiento</Text>
      {lastWorkout ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push({ pathname: '/workout/[id]', params: { id: lastWorkout.id } })}
        >
          <Card>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{lastWorkout.name}</Text>
                <Text style={styles.muted}>
                  {formatDateTime(lastWorkout.startedAt)} -{' '}
                  {formatDuration(lastWorkout.startedAt, lastWorkout.finishedAt)}
                </Text>
              </View>
              <ArrowRight color={colors.textMuted} size={20} />
            </View>
          </Card>
        </TouchableOpacity>
      ) : (
        <Text style={styles.muted}>Las sesiones finalizadas apareceran aqui.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
    gap: spacing.xs,
  },
  stack: {
    gap: spacing.md,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catalogItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
    width: '48%',
  },
  catalogName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
