import { useState } from 'react';
import { exerciseName } from '@/i18n/exercises';
import { useWeight } from '@/hooks/useWeight';
import { useTranslation } from '@/i18n';
import { dialogs } from '@/store/dialogStore';
import { router } from 'expo-router';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { IconButton } from '@/components/IconButton';
import { useRepositories } from '@/hooks/useRepositories';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { useActiveWorkoutSession } from '@/features/workouts/hooks/useActiveWorkoutSession';
import { useRestTimer } from '@/hooks/useRestTimer';
import { baseRoutines, stepTarget } from '@/features/routines/baseRoutines';
import { walkingExerciseId } from '@/database/seed/exercises';
import { formatDateTime } from '@/utils/date';
import { formatWeight } from '@/utils/weight';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function ActiveWorkoutScreen() {
  const { t, language } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  const { unit } = useWeight();
  const { colors, styles } = useThemedStyles(createStyles);
  const { session, loading, error, addExercise, finish } = useActiveWorkoutSession();
  const { exercises } = useExerciseCatalog();
  const timer = useRestTimer();
  const { workouts } = useRepositories();

  async function safeAddExercise(exerciseId: string) {
    if (addingExerciseId) return;
    setAddingExerciseId(exerciseId);
    try {
      await addExercise(exerciseId);
    } catch (caughtError) {
      dialogs.alert(t('No se pudo agregar el ejercicio'), getErrorMessage(caughtError));
    } finally {
      setAddingExerciseId(null);
    }
  }

  function confirmFinish() {
    dialogs.confirm({
      title: t('Un entrenamiento más. Un paso adelante.'),
      message: t(
        'Guarda esta sesión en tu historial para consultar tus series y seguir tu progreso.',
      ),
      tone: 'success',
      confirmLabel: t('Finalizar y guardar'),
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
      <Screen title={t('Entrenamiento activo')}>
        <LoadingState label={t('Cargando entrenamiento activo')} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title={t('Entrenamiento activo')}>
        <EmptyState title={t('Entrenamiento no disponible')} message={error} />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen title={t('Entrenamiento activo')}>
        <EmptyState
          title={t('No hay entrenamiento activo')}
          message={t('Empieza desde una rutina o abre un entrenamiento libre.')}
          action={<AppButton label={t('Ir a rutinas')} onPress={() => router.push('/routines')} />}
        />
      </Screen>
    );
  }

  const activeExerciseIds = new Set(session.exercises.map((exercise) => exercise.exerciseId));
  const guide = baseRoutines.find((item) => item.id === session.baseRoutineId);
  const availableExercises = exercises.filter((exercise) => !activeExerciseIds.has(exercise.id));
  const searchTerm = catalogSearch.trim().toLocaleLowerCase();
  const filteredExercises = availableExercises.filter((exercise) =>
    `${exerciseName(exercise)} ${translateMuscleGroup(exercise.muscleGroup)}`
      .toLocaleLowerCase()
      .includes(searchTerm),
  );
  const completedCount = session.exercises.filter((exercise) => exercise.completed).length;

  return (
    <Screen
      title={session.name}
      subtitle={t('Inicio: {{date}}', { date: formatDateTime(session.startedAt) })}
      right={<AppButton label={t('Finalizar')} onPress={confirmFinish} />}
    >
      {session.exercises.length > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t('Tu progreso')}</Text>
            <Text style={styles.progressCount}>
              {t('{{completed}} de {{total}} ejercicios', {
                completed: completedCount,
                total: session.exercises.length,
              })}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / session.exercises.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
      {session.exercises.length === 0 ? (
        <EmptyState
          title={t('No hay ejercicios')}
          message={t('Agrega un ejercicio para registrar series.')}
        />
      ) : (
        <View style={styles.stack}>
          {session.exercises.map((workoutExercise) => {
            const step = guide?.steps.find(
              (item) => item.exerciseId === workoutExercise.exerciseId,
            );
            const timed = workoutExercise.exerciseId === walkingExerciseId;
            return (
              <Card key={workoutExercise.id}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.exerciseName}>
                      {exerciseName(workoutExercise.exercise)}
                    </Text>
                    <Text style={styles.muted}>
                      {translateMuscleGroup(workoutExercise.exercise?.muscleGroup)}
                    </Text>
                    <Text style={workoutExercise.completed ? styles.target : styles.muted}>
                      {workoutExercise.completed ? t('Completado') : t('Pendiente')} ·{' '}
                      {t('{{count}} series completadas', {
                        count: workoutExercise.sets.filter((set) => set.completed).length,
                      })}
                    </Text>
                  </View>
                  <IconButton
                    accessibilityLabel={t('Quitar {{name}}', {
                      name: exerciseName(workoutExercise.exercise),
                    })}
                    icon={<Trash2 size={18} color={colors.danger} />}
                    onPress={() =>
                      dialogs.confirm({
                        title: t('¿Quitar este ejercicio?'),
                        message: t(
                          'Se quitará de este entrenamiento junto con sus series. Permanecerá en el catálogo.',
                        ),
                        confirmLabel: t('Quitar ejercicio'),
                        onConfirm: () => workouts.removeExercise(workoutExercise.id),
                      })
                    }
                  />
                </View>
                {step && <Text style={styles.target}>{stepTarget(step)}</Text>}
                <AppButton
                  label={
                    workoutExercise.completed
                      ? t('Revisar ejercicio')
                      : workoutExercise.sets.some((set) => set.completed)
                        ? t('Continuar ejercicio')
                        : t('Iniciar ejercicio')
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/workout/exercise/[id]',
                      params: { id: workoutExercise.id },
                    })
                  }
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expanded === workoutExercise.id }}
                  onPress={() =>
                    setExpanded(expanded === workoutExercise.id ? null : workoutExercise.id)
                  }
                  style={styles.addRow}
                >
                  <Text style={[styles.muted, styles.flex]}>{t('Ver series realizadas')}</Text>
                  {expanded === workoutExercise.id ? (
                    <ChevronUp color={colors.textMuted} size={20} />
                  ) : (
                    <ChevronDown color={colors.textMuted} size={20} />
                  )}
                </TouchableOpacity>
                {expanded === workoutExercise.id &&
                  (workoutExercise.sets.filter((set) => set.completed).length ? (
                    workoutExercise.sets
                      .filter((set) => set.completed)
                      .map((set) => (
                        <Text key={set.id} style={styles.muted}>
                          {t('Serie {{number}}', { number: set.setNumber })} ·{' '}
                          {timed
                            ? `${set.durationSeconds === null ? '—' : set.durationSeconds / 60} min`
                            : `${formatWeight(set.weight, unit, language)} ${unit} · ${set.repetitions ?? '—'} reps`}
                        </Text>
                      ))
                  ) : (
                    <Text style={styles.muted}>{t('Aún no hay series completadas.')}</Text>
                  ))}
              </Card>
            );
          })}
        </View>
      )}

      <AppButton
        label={showCatalog ? t('Cerrar catálogo') : t('Agregar ejercicio')}
        variant="secondary"
        onPress={() => setShowCatalog(!showCatalog)}
      />
      {showCatalog && (
        <>
          <TextInput
            accessibilityLabel={t('Buscar ejercicios')}
            placeholder={t('Buscar ejercicios')}
            placeholderTextColor={colors.textMuted}
            value={catalogSearch}
            onChangeText={setCatalogSearch}
            autoCorrect={false}
            style={styles.search}
          />
          <View style={styles.stack}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t('Agregar {{name}}', { name: exerciseName(exercise) })}
                disabled={addingExerciseId !== null}
                key={exercise.id}
                onPress={() => safeAddExercise(exercise.id)}
              >
                <Card>
                  <View style={styles.addRow}>
                    <View style={styles.flex}>
                      <Text style={styles.exerciseName}>{exerciseName(exercise)}</Text>
                      <Text style={styles.muted}>{translateMuscleGroup(exercise.muscleGroup)}</Text>
                    </View>
                    <Plus color={colors.primary} size={20} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
          {availableExercises.length === 0 ? (
            <Text style={styles.muted}>
              {t('Todos los ejercicios del catalogo ya fueron agregados.')}
            </Text>
          ) : filteredExercises.length === 0 ? (
            <Text style={styles.muted}>{t('Sin coincidencias')}</Text>
          ) : null}
          <AppButton
            label={t('Crear un ejercicio nuevo')}
            variant="secondary"
            icon={<Plus size={18} color={colors.text} />}
            onPress={() =>
              router.push({ pathname: '/exercise/create', params: { returnTo: 'previous' } })
            }
          />
        </>
      )}
      <AppButton
        label={t('Descartar entrenamiento')}
        variant="ghost"
        icon={<Trash2 size={18} color={colors.danger} />}
        onPress={() =>
          dialogs.confirm({
            title: t('¿Descartar esta sesión?'),
            message: t(
              'Se eliminará el entrenamiento en curso y sus series. No aparecerá en tu historial.',
            ),
            confirmLabel: t('Descartar entrenamiento'),
            onConfirm: async () => {
              await workouts.deleteSession(session.id);
              timer.cancel();
              router.replace('/');
            },
          })
        }
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    progressCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    progressTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
    progressCount: { color: colors.textMuted, fontSize: 13, flexShrink: 1, textAlign: 'right' },
    progressTrack: {
      height: 6,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    search: {
      minHeight: 48,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      color: colors.text,
      paddingHorizontal: spacing.md,
      fontSize: 15,
    },
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
    target: { color: colors.primary, fontSize: 14, fontWeight: '700' },
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
