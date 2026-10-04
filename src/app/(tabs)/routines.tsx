import { useTranslation } from '@/i18n';
import { dialogs } from '@/store/dialogStore';
import { router } from 'expo-router';
import { ArrowRight, Play, Plus } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useRoutines } from '@/features/routines/hooks/useRoutines';
import { useRepositories } from '@/hooks/useRepositories';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import type { RoutineSummary } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export default function RoutinesScreen() {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const { routines, loading, error } = useRoutines();
  const { workouts } = useRepositories();
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);

  async function startRoutine(routine: RoutineSummary) {
    try {
      const session = await workouts.startFromRoutine(routine.id);
      setActiveWorkoutId(session.id);
      router.push('/workout/active');
    } catch (caughtError) {
      dialogs.alert(t('No se pudo iniciar la rutina'), getErrorMessage(caughtError));
    }
  }

  return (
    <Screen
      title={t('Rutinas')}
      subtitle={t('Crea planes reutilizables para iniciar entrenamientos offline.')}
      right={
        <AppButton
          label={t('Nueva')}
          icon={<Plus color={colors.ink} size={16} />}
          onPress={() => router.push('/routine/create')}
        />
      }
    >
      {loading ? <LoadingState label={t('Cargando rutinas')} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && routines.length === 0 ? (
        <EmptyState
          title={t('No hay rutinas')}
          message={t('Crea tu primera rutina y agrega ejercicios desde el catalogo local.')}
          action={
            <AppButton label={t('Crear rutina')} onPress={() => router.push('/routine/create')} />
          }
        />
      ) : null}
      <View style={styles.stack}>
        {routines.map((routine) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={routine.id}
            onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
          >
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.title}>{routine.name}</Text>
                  <Text style={styles.muted}>
                    {routine.exerciseCount}{' '}
                    {routine.exerciseCount === 1 ? t('ejercicio') : t('ejercicios')}
                  </Text>
                  {routine.description ? (
                    <Text style={styles.description}>{routine.description}</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => startRoutine(routine)} style={styles.startButton}>
                  <Play color={colors.ink} size={18} />
                </TouchableOpacity>
                <ArrowRight color={colors.textMuted} size={20} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    stack: {
      gap: spacing.md,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
    },
    flex: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
    muted: {
      color: colors.textMuted,
      fontSize: 13,
    },
    description: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    startButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    error: {
      color: colors.danger,
    },
  });
