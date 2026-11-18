import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { radius, spacing, type ThemeColors } from '@/constants/theme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { baseRoutines, stepTarget } from '@/features/routines/baseRoutines';
import { useRepositories } from '@/hooks/useRepositories';
import { useThemedStyles } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n';
import { exerciseName } from '@/i18n/exercises';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { dialogs } from '@/store/dialogStore';
import { getErrorMessage } from '@/utils/errors';

export function BaseRoutinePicker() {
  const { styles } = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [guide, setGuide] = useState(baseRoutines[0]);
  const [starting, setStarting] = useState(false);
  const { exercises, loading, error } = useExerciseCatalog();
  const { workouts } = useRepositories();
  const activeId = useActiveWorkoutStore((state) => state.activeWorkoutId);
  const setActiveId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);
  const steps = guide.steps.flatMap((step) => {
    const exercise = exercises.find((item) => item.id === step.exerciseId);
    return exercise ? [{ step, exercise }] : [];
  });

  async function start() {
    setStarting(true);
    try {
      if (!activeId) setActiveId(await workouts.startFromBaseRoutine(guide.id));
      router.push('/workout/active');
    } catch (caught) {
      dialogs.alert(t('No se pudo iniciar la rutina'), t(getErrorMessage(caught)));
    } finally {
      setStarting(false);
    }
  }

  return (
    <View style={styles.stack}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('Rutinas base')}
      </Text>
      <View style={styles.choices}>
        {baseRoutines.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: item.id === guide.id }}
            style={[styles.choice, item.id === guide.id && styles.selected]}
            onPress={() => setGuide(item)}
          >
            <Text style={styles.name}>{t(item.name)}</Text>
          </Pressable>
        ))}
      </View>
      <Card>
        <Text style={styles.heading}>{t(guide.name)}</Text>
        <Text style={styles.muted}>{t(guide.description)}</Text>
        {loading ? (
          <LoadingState label={t('Cargando')} />
        ) : error ? (
          <Text style={styles.muted}>{error}</Text>
        ) : (
          <>
            {steps.map(({ step, exercise }, index) => (
              <Pressable
                key={exercise.id}
                style={styles.step}
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/exercise/[id]', params: { id: exercise.id } })
                }
              >
                <Text style={styles.name}>
                  {index + 1}. {exerciseName(exercise)}
                </Text>
                <Text style={styles.muted}>{stepTarget(step)}</Text>
              </Pressable>
            ))}
            {steps.length < guide.steps.length && (
              <Text style={styles.muted}>
                {t('Solo se incluyen los ejercicios disponibles en tu catálogo.')}
              </Text>
            )}
            <AppButton
              label={activeId ? t('Retomar entrenamiento') : t('Iniciar esta guía')}
              disabled={starting || (!activeId && !steps.length)}
              onPress={start}
            />
          </>
        )}
      </Card>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    stack: { gap: spacing.md },
    choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    choice: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    selected: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
    step: {
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
    name: { color: colors.text, fontWeight: '700', fontSize: 15 },
    muted: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  });
