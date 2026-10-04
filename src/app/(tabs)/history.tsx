import { useTranslation } from '@/i18n';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/Card';
import { AppButton } from '@/components/AppButton';
import { dialogs } from '@/store/dialogStore';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { type ThemeColors, spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useWorkoutHistory } from '@/features/history/hooks/useWorkoutHistory';
import { formatDateTime, formatDuration } from '@/utils/date';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const { history, loading, error, clearHistory, clearing } = useWorkoutHistory();

  return (
    <Screen
      title={t('Historial')}
      subtitle={t('Entrenamientos finalizados guardados en este dispositivo.')}
    >
      <AppButton
        label={clearing ? t('Limpiando historial…') : t('Limpiar historial')}
        variant="danger"
        disabled={loading || clearing || history.length === 0}
        onPress={() =>
          dialogs.confirm({
            title: t('¿Limpiar todo el historial?'),
            message: t(
              'Se eliminarán permanentemente todos los entrenamientos finalizados y sus series de este dispositivo, incluido el rendimiento anterior. Tus rutinas, ejercicios y entrenamiento activo se conservarán. Esta acción no se puede deshacer.',
            ),
            confirmLabel: t('Limpiar historial'),
            onConfirm: () => clearHistory(),
          })
        }
      />
      {loading ? <LoadingState label={t('Cargando historial')} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && history.length === 0 ? (
        <EmptyState
          title={t('No hay entrenamientos finalizados')}
          message={t('Finaliza un entrenamiento y quedara disponible aqui, incluso sin internet.')}
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
                    {formatDateTime(item.startedAt)} -{' '}
                    {formatDuration(item.startedAt, item.finishedAt)}
                  </Text>
                  <Text style={styles.muted}>
                    {item.exerciseCount} {t('ejercicios -')} {item.completedSetCount}{' '}
                    {t('series completadas')}{' '}
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
    error: {
      color: colors.danger,
    },
  });
