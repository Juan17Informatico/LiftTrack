import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useWorkoutHistory } from '@/features/history/hooks/useWorkoutHistory';
import { formatDateTime, formatDuration } from '@/utils/date';

export default function HistoryScreen() {
  const { history, loading, error } = useWorkoutHistory();

  return (
    <Screen title="Historial" subtitle="Entrenamientos finalizados guardados en este dispositivo.">
      {loading ? <LoadingState label="Cargando historial" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && history.length === 0 ? (
        <EmptyState
          title="No hay entrenamientos finalizados"
          message="Finaliza un entrenamiento y quedara disponible aqui, incluso sin internet."
        />
      ) : null}
      <View style={styles.stack}>
        {history.map((item) => (
          <TouchableOpacity
            activeOpacity={0.75}
            key={item.id}
            onPress={() => router.push({ pathname: '/workout/[id]', params: { id: item.id } })}
          >
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.muted}>
                    {formatDateTime(item.startedAt)} - {formatDuration(item.startedAt, item.finishedAt)}
                  </Text>
                  <Text style={styles.muted}>
                    {item.exerciseCount} ejercicios - {item.completedSetCount} series completadas
                  </Text>
                </View>
                <ArrowRight color={colors.textMuted} size={20} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  error: {
    color: colors.danger,
  },
});
