import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Animated, Easing, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { type ThemeColors, radius, spacing } from '@/constants/theme';
import { walkingExerciseId } from '@/database/seed/exercises';
import { baseRoutines, stepTarget } from '@/features/routines/baseRoutines';
import { PreviousPerformance } from '@/features/workouts/components/PreviousPerformance';
import { WorkoutSetRow } from '@/features/workouts/components/WorkoutSetRow';
import { useActiveWorkoutSession } from '@/features/workouts/hooks/useActiveWorkoutSession';
import { useRepositories } from '@/hooks/useRepositories';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useThemedStyles } from '@/hooks/useTheme';
import { useWeight } from '@/hooks/useWeight';
import { useTranslation } from '@/i18n';
import { exerciseInstructions, exerciseName } from '@/i18n/exercises';
import { dialogs } from '@/store/dialogStore';
import { formatTimer } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function WorkoutExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { unit } = useWeight();
  const { colors, styles } = useThemedStyles(createStyles);
  const { session, loading, error, addSet, updateSet, deleteSet } = useActiveWorkoutSession();
  const { workouts } = useRepositories();
  const timer = useRestTimer();
  const [customSeconds, setCustomSeconds] = useState('');
  const showCustomStart = customSeconds.trim().length > 0;
  const customStartAnimation = useRef(new Animated.Value(0)).current;
  const [busy, setBusy] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [addingSet, setAddingSet] = useState(false);
  const setSaves = useRef(new Map<string, () => Promise<void>>());
  const registerSave = useCallback((setId: string, save: (() => Promise<void>) | null) => {
    if (save) setSaves.current.set(setId, save);
    else setSaves.current.delete(setId);
  }, []);
  const exercise = session?.exercises.find((item) => item.id === id);

  useEffect(() => {
    const animation = Animated.timing(customStartAnimation, {
      toValue: showCustomStart ? 1 : 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [customStartAnimation, showCustomStart]);

  async function changeCompletion(completed: boolean) {
    if (!exercise || busy) return;
    setBusy(true);
    try {
      if (completed) await Promise.all([...setSaves.current.values()].map((save) => save()));
      await workouts.setExerciseCompleted(exercise.id, completed);
      if (completed) {
        timer.cancel();
        router.back();
      }
    } catch (caughtError) {
      dialogs.alert(t('No se pudo actualizar el ejercicio'), getErrorMessage(caughtError));
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <Screen>
        <LoadingState label={t('Cargando ejercicio')} />
      </Screen>
    );
  if (error || !exercise)
    return (
      <Screen>
        <EmptyState
          title={t('Ejercicio no disponible')}
          message={error ?? t('Este ejercicio ya no pertenece al entrenamiento activo.')}
        />
      </Screen>
    );

  const timed = exercise.exerciseId === walkingExerciseId;
  const step = baseRoutines
    .find((item) => item.id === session?.baseRoutineId)
    ?.steps.find((item) => item.exerciseId === exercise.exerciseId);
  const instructions = exercise.exercise ? exerciseInstructions(exercise.exercise) : null;
  return (
    <Screen
      title={exerciseName(exercise.exercise)}
      subtitle={translateMuscleGroup(exercise.exercise?.muscleGroup)}
    >
      <Card>
        <Text style={styles.title}>{t('Series')}</Text>
        {!exercise.completed && exercise.sets.length === 0 && (
          <Text style={styles.body}>{t('Agrega una serie para registrar tu progreso.')}</Text>
        )}
        {exercise.completed ? <Text style={styles.target}>{t('Ejercicio completado')}</Text> : null}
        {!exercise.completed && exercise.sets.length > 0 && (
          <View style={styles.header}>
            <Text style={styles.number}>#</Text>
            <Text style={styles.headerText}>
              {timed ? t('Minutos') : t('Peso ({{unit}})', { unit })}
            </Text>
            {!timed && <Text style={styles.headerText}>{t('Reps')}</Text>}
            <Text style={styles.actionHeader}>{t('Borrar')}</Text>
          </View>
        )}
        {!exercise.completed &&
          exercise.sets.map((set) => (
            <WorkoutSetRow
              key={set.id}
              set={set}
              timed={timed}
              onUpdate={updateSet}
              registerSave={registerSave}
              onDelete={async (setId) =>
                dialogs.confirm({
                  title: t('¿Eliminar esta serie?'),
                  message: t('Se quitaran el peso y las repeticiones de esta serie.'),
                  confirmLabel: t('Eliminar serie'),
                  onConfirm: () => deleteSet(setId),
                })
              }
            />
          ))}
        {exercise.completed ? (
          <AppButton
            label={t('Reabrir ejercicio')}
            variant="secondary"
            disabled={busy}
            onPress={() => changeCompletion(false)}
          />
        ) : (
          <AppButton
            label={t('Agregar serie')}
            disabled={addingSet}
            onPress={async () => {
              if (addingSet) return;
              setAddingSet(true);
              try {
                await addSet(exercise.id);
                setShowRest(false);
              } catch (caughtError) {
                dialogs.alert(t('No se pudo agregar la serie'), getErrorMessage(caughtError));
              } finally {
                setAddingSet(false);
              }
            }}
          />
        )}
      </Card>
      {!exercise.completed && exercise.sets.length > 0 && timer.status === 'idle' && (
        <AppButton
          label={showRest ? t('Ocultar descanso') : t('Tomar un descanso')}
          variant="secondary"
          onPress={() => setShowRest(!showRest)}
        />
      )}
      {(showRest || timer.status !== 'idle') && (
        <Card>
          <Text style={styles.title}>{t('Descanso')}</Text>
          <Text accessibilityLiveRegion="polite" style={styles.timer}>
            {formatTimer(timer.remainingSeconds)}
          </Text>
          <View style={styles.row}>
            {[60, 90, 120].map((seconds) => (
              <AppButton
                key={seconds}
                label={seconds === 120 ? '2 min' : `${seconds} s`}
                variant="secondary"
                onPress={() => timer.start(seconds)}
              />
            ))}
          </View>
          <View style={styles.row}>
            <TextInput
              keyboardType="number-pad"
              accessibilityLabel={t('Descanso personalizado en segundos')}
              placeholder={t('Segundos')}
              placeholderTextColor={colors.textMuted}
              value={customSeconds}
              onChangeText={setCustomSeconds}
              style={styles.input}
            />
            <Animated.View
              pointerEvents={showCustomStart ? 'auto' : 'none'}
              accessibilityElementsHidden={!showCustomStart}
              importantForAccessibility={showCustomStart ? 'auto' : 'no-hide-descendants'}
              style={{
                width: customStartAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 120],
                }),
                opacity: customStartAnimation,
                overflow: 'hidden',
              }}
            >
              <AppButton
                label={t('Iniciar')}
                variant="secondary"
                onPress={() => {
                  const seconds = Number(customSeconds);
                  if (!Number.isSafeInteger(seconds) || seconds <= 0 || seconds > 86400) {
                    dialogs.alert(t('Tiempo invalido'), t('Ingresa entre 1 y 86400 segundos.'));
                    return;
                  }
                  timer.start(seconds);
                }}
              />
            </Animated.View>
          </View>
          {timer.status !== 'idle' && (
            <View style={styles.row}>
              <AppButton
                label={timer.status === 'running' ? t('Pausar') : t('Continuar')}
                variant="secondary"
                onPress={timer.status === 'running' ? timer.pause : timer.resume}
              />
              <AppButton
                label={t('Reiniciar')}
                variant="ghost"
                onPress={() => timer.start(timer.durationSeconds)}
              />
            </View>
          )}
        </Card>
      )}
      <Card>
        {step && <Text style={styles.target}>{stepTarget(step)}</Text>}
        {instructions && <Text style={styles.body}>{instructions}</Text>}
        <PreviousPerformance exerciseId={exercise.exerciseId} />
      </Card>
      <AppButton
        label={exercise.completed ? t('Volver al entrenamiento') : t('Finalizar ejercicio')}
        disabled={busy}
        onPress={() => (exercise.completed ? router.back() : changeCompletion(true))}
      />
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    title: { color: colors.text, fontSize: 18, fontWeight: '800' },
    body: { color: colors.text, fontSize: 15, lineHeight: 22 },
    target: { color: colors.primary, fontWeight: '700' },
    timer: {
      color: colors.primary,
      fontSize: 42,
      fontWeight: '900',
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
    input: {
      flex: 1,
      minWidth: 100,
      minHeight: 46,
      color: colors.text,
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    number: { width: 24, color: colors.textMuted, textAlign: 'center' },
    headerText: { flex: 1, color: colors.textMuted, fontSize: 11, textAlign: 'center' },
    actionHeader: { width: 40, color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  });
