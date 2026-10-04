import { exerciseName } from '@/i18n/exercises';
import { useTranslation } from '@/i18n';
import { useDeferredValue, useState } from 'react';
import { router } from 'expo-router';
import { ChevronRight, Dumbbell, Plus, Search } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { type ThemeColors } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { translateEquipment, translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const { colors, styles } = useThemedStyles(createStyles);
  const [search, setSearch] = useState('');
  const term = useDeferredValue(search);
  const { exercises, loading, error } = useExerciseCatalog(term);
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('TU BIBLIOTECA')}</Text>
        <View style={styles.heading}>
          <Text style={styles.title}>{t('Ejercicios')}</Text>
          <AppButton
            label={t('Nuevo')}
            icon={<Plus size={18} color={colors.ink} />}
            onPress={() => router.push('/exercise/create')}
          />
        </View>
        <Text style={styles.subtitle}>{t('El catálogo de siempre. Tus propios movimientos.')}</Text>
        <View style={styles.search}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            accessibilityLabel={t('Buscar ejercicios')}
            placeholder={t('Buscar por nombre…')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        <Text style={styles.count}>
          {exercises.length}{' '}
          {exercises.length === 1 ? t('ejercicio disponible') : t('ejercicios disponibles')}
        </Text>
      </View>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <LoadingState label={t('Cargando biblioteca')} />
          ) : (
            <EmptyState
              title={
                error
                  ? t('No se pudo cargar')
                  : search
                    ? t('Sin coincidencias')
                    : t('Tu biblioteca empieza aquí')
              }
              message={error ?? t('Crea un ejercicio o prueba con otro nombre.')}
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Ver {{name}}', { name: exerciseName(item) })}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.id } })}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}
          >
            <View style={styles.icon}>
              <Dumbbell size={22} color={colors.success} />
            </View>
            <View style={styles.itemText}>
              <Text style={styles.name}>{exerciseName(item)}</Text>
              <Text style={styles.meta}>
                {translateMuscleGroup(item.muscleGroup)} · {translateEquipment(item.equipment)}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { padding: 20, gap: 14 },
    eyebrow: { color: colors.success, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, flexShrink: 1 },
    subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 21 },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, minHeight: 50, color: colors.text, fontSize: 15 },
    count: { fontSize: 12, color: colors.textMuted },
    list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
    item: {
      padding: 14,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: `${colors.success}14`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemText: { flex: 1, gap: 5 },
    name: { color: colors.text, fontSize: 15, fontWeight: '700' },
    meta: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  });
