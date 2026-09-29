import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { AppButton } from '@/components/AppButton';
import { useRepositories } from '@/hooks/useRepositories';
import { dialogs } from '@/store/dialogStore';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { WorkoutSessionSummary } from '@/features/workouts/components/WorkoutSessionSummary';
import { useWorkoutDetail } from '@/features/workouts/hooks/useWorkoutDetail';
import { formatDateTime, formatDuration } from '@/utils/date';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading, error } = useWorkoutDetail(id);
  const { workouts } = useRepositories();

  if (loading) {
    return (
      <Screen title="Entrenamiento">
        <LoadingState label="Cargando entrenamiento" />
      </Screen>
    );
  }

  if (error || !session) {
    return (
      <Screen title="Entrenamiento">
        <EmptyState title="Entrenamiento no encontrado" message={error ?? 'Esta sesion no esta disponible.'} />
      </Screen>
    );
  }

  return (
    <Screen title={session.name} subtitle={formatDateTime(session.startedAt)}>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Duracion: {formatDuration(session.startedAt, session.finishedAt)}</Text>
        <Text style={styles.meta}>{session.exercises.length} ejercicios</Text>
      </View>
      <WorkoutSessionSummary session={session} />
      <AppButton label="Eliminar entrenamiento" variant="ghost" icon={<Trash2 size={18} color={colors.danger} />}
        onPress={() => dialogs.confirm({
          title: '¿Eliminar este entrenamiento?',
          message: `Se quitarán “${session.name}” y sus series del historial y del rendimiento anterior. Esta acción no se puede deshacer desde la app.`,
          confirmLabel: 'Eliminar entrenamiento',
          onConfirm: async () => { await workouts.deleteSession(id); router.replace('/history'); },
        })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meta: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
