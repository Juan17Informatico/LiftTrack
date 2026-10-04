import { exerciseName, exerciseInstructions } from '@/i18n/exercises';
import { useWeight } from '@/hooks/useWeight';
import { useTranslation } from '@/i18n';
import { router, useLocalSearchParams } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { AppButton } from '@/components/AppButton';
import { useRepositories } from '@/hooks/useRepositories';
import { dialogs } from '@/store/dialogStore';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useExerciseDetail } from '@/features/exercises/hooks/useExerciseDetail';
import { formatDateTime } from '@/utils/date';
import {
  translateEquipment,
  translateMuscleGroup,
  translateMuscleGroups,
} from '@/utils/exerciseMetadata';

export default function ExerciseDetailScreen() {
  const { t } = useTranslation();
  const { unit, format } = useWeight();
  const { colors, styles } = useThemedStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, previousSets, loading, error } = useExerciseDetail(id);
  const { exercises } = useRepositories();

  if (loading) {
    return (
      <Screen title={t('Ejercicio')}>
        <LoadingState label={t('Cargando ejercicio')} />
      </Screen>
    );
  }

  if (error || !exercise) {
    return (
      <Screen title={t('Ejercicio')}>
        <EmptyState
          title={t('Ejercicio no encontrado')}
          message={error ?? t('Este ejercicio no esta disponible.')}
        />
      </Screen>
    );
  }

  return (
    <Screen title={exerciseName(exercise)} subtitle={translateMuscleGroup(exercise.muscleGroup)}>
      {exercise.deletedAt ? (
        <Text style={styles.muted}>
          {t('Retirado del catálogo. Sus registros de entrenamiento se conservan.')}
        </Text>
      ) : (
        <AppButton
          label={t('Editar ejercicio')}
          variant="secondary"
          icon={<Pencil size={18} color={colors.text} />}
          onPress={() => router.push({ pathname: '/exercise/edit', params: { id } })}
        />
      )}
      <Card>
        <Text style={styles.title}>{t('Detalles')}</Text>
        <Text style={styles.muted}>
          {t('Equipo:')} {translateEquipment(exercise.equipment)}
        </Text>
        {exercise.secondaryMuscles.length > 0 ? (
          <Text style={styles.muted}>
            {t('Secundarios:')} {translateMuscleGroups(exercise.secondaryMuscles)}
          </Text>
        ) : null}
        {exercise.instructions ? (
          <Text style={styles.body}>{exerciseInstructions(exercise)}</Text>
        ) : null}
      </Card>

      <Card>
        <Text style={styles.title}>{t('Ultimo rendimiento')}</Text>
        {previousSets.length === 0 ? (
          <Text style={styles.muted}>{t('Aun no hay series completadas.')}</Text>
        ) : (
          <View style={styles.stack}>
            <Text style={styles.muted}>{formatDateTime(previousSets[0].performedAt)}</Text>
            {previousSets.map((set) => (
              <View key={`${set.performedAt}-${set.setNumber}`} style={styles.row}>
                <Text style={styles.muted}>
                  {t('Serie')} {set.setNumber}
                </Text>
                <Text style={styles.value}>
                  {format(set.weight)} {unit} × {set.repetitions ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
      {!exercise.deletedAt ? (
        <AppButton
          label={t('Eliminar del catálogo')}
          variant="ghost"
          icon={<Trash2 size={18} color={colors.danger} />}
          onPress={() =>
            dialogs.confirm({
              title: t('¿Eliminar este ejercicio?'),
              message: t(
                '“{{name}}” dejará de aparecer en el catálogo y en tus rutinas. Los entrenamientos ya registrados se conservan.',
                { name: exerciseName(exercise) },
              ),
              confirmLabel: t('Eliminar ejercicio'),
              onConfirm: async () => {
                await exercises.delete(id);
                router.replace('/exercises');
              },
            })
          }
        />
      ) : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
