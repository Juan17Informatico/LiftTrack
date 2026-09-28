import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, Play } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FormTextInput } from '@/components/FormTextInput';
import { IconButton } from '@/components/IconButton';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { colors, spacing } from '@/constants/theme';
import { useExerciseCatalog } from '@/features/exercises/hooks/useExerciseCatalog';
import { useRoutineDetail } from '@/features/routines/hooks/useRoutineDetail';
import { useRepositories } from '@/hooks/useRepositories';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import { routineFormSchema, type RoutineFormInput } from '@/schemas/routineSchemas';
import { getErrorMessage } from '@/utils/errors';
import { translateMuscleGroup } from '@/utils/exerciseMetadata';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routine, loading, error } = useRoutineDetail(id);
  const { exercises } = useExerciseCatalog();
  const { routines, workouts } = useRepositories();
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<RoutineFormInput>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const savedName = routine?.name;
  const savedDescription = routine?.description;

  useEffect(() => {
    if (savedName !== undefined) {
      reset({
        name: savedName,
        description: savedDescription ?? '',
      });
    }
  }, [id, reset, savedDescription, savedName]);

  async function addExercise(exerciseId: string) {
    if (!routine) {
      return;
    }

    try {
      await routines.addExercise(routine.id, { exerciseId });
    } catch (caughtError) {
      Alert.alert('No se pudo agregar el ejercicio', getErrorMessage(caughtError));
    }
  }

  async function removeExercise(routineExerciseId: string) {
    try {
      await routines.removeExercise(routineExerciseId);
    } catch (caughtError) {
      Alert.alert('No se pudo quitar el ejercicio', getErrorMessage(caughtError));
    }
  }

  async function moveExercise(routineExerciseId: string, direction: 'up' | 'down') {
    try {
      await routines.moveExercise(routineExerciseId, direction);
    } catch (caughtError) {
      Alert.alert('No se pudo mover el ejercicio', getErrorMessage(caughtError));
    }
  }

  async function startWorkout() {
    if (!routine) {
      return;
    }

    try {
      const session = await workouts.startFromRoutine(routine.id);
      setActiveWorkoutId(session.id);
      router.push('/workout/active');
    } catch (caughtError) {
      Alert.alert('No se pudo iniciar el entrenamiento', getErrorMessage(caughtError));
    }
  }

  const onSave = handleSubmit(async (input) => {
    if (!routine) {
      return;
    }

    try {
      const updated = await routines.update(routine.id, input);
      reset({ name: updated.name, description: updated.description ?? '' });
    } catch (caughtError) {
      Alert.alert('No se pudo guardar la rutina', getErrorMessage(caughtError));
    }
  });

  if (loading) {
    return (
      <Screen title="Rutina">
        <LoadingState label="Cargando rutina" />
      </Screen>
    );
  }

  if (error || !routine) {
    return (
      <Screen title="Rutina">
        <EmptyState title="Rutina no encontrada" message={error ?? 'Esta rutina no esta disponible.'} />
      </Screen>
    );
  }

  const addedExerciseIds = new Set(routine.exercises.map((exercise) => exercise.exerciseId));
  const availableExercises = exercises.filter((exercise) => !addedExerciseIds.has(exercise.id));

  return (
    <Screen
      title={routine.name}
      subtitle={`${routine.exercises.length} ${
        routine.exercises.length === 1 ? 'ejercicio' : 'ejercicios'
      }`}
      right={
        <AppButton
          icon={<Play color={colors.ink} size={18} />}
          label="Iniciar"
          onPress={startWorkout}
        />
      }
    >
      <Card>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <FormTextInput
              error={errors.name?.message}
              label="Nombre"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onBlur, onChange, value } }) => (
            <FormTextInput
              error={errors.description?.message}
              label="Descripcion"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              style={styles.textArea}
              value={value}
            />
          )}
        />
        <AppButton
          disabled={isSubmitting}
          icon={<Save color={colors.ink} size={18} />}
          label="Guardar cambios"
          onPress={onSave}
        />
      </Card>

      <Text style={styles.sectionTitle}>Ejercicios de la rutina</Text>
      {routine.exercises.length === 0 ? (
        <EmptyState title="No hay ejercicios" message="Agrega movimientos desde el catalogo local." />
      ) : (
        <View style={styles.stack}>
          {routine.exercises.map((routineExercise, index) => (
            <Card key={routineExercise.id}>
              <View style={styles.exerciseRow}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({
                      pathname: '/exercise/[id]',
                      params: { id: routineExercise.exerciseId },
                    })
                  }
                  style={styles.exerciseCopy}
                >
                  <Text style={styles.exerciseName}>{routineExercise.exercise?.name}</Text>
                  <Text style={styles.muted}>
                    {translateMuscleGroup(routineExercise.exercise?.muscleGroup)}
                  </Text>
                </TouchableOpacity>
                <View style={styles.actions}>
                  <IconButton
                    accessibilityLabel="Mover ejercicio arriba"
                    disabled={index === 0}
                    icon={<ArrowUp color={colors.text} size={17} />}
                    onPress={() => moveExercise(routineExercise.id, 'up')}
                  />
                  <IconButton
                    accessibilityLabel="Mover ejercicio abajo"
                    disabled={index === routine.exercises.length - 1}
                    icon={<ArrowDown color={colors.text} size={17} />}
                    onPress={() => moveExercise(routineExercise.id, 'down')}
                  />
                  <IconButton
                    accessibilityLabel="Quitar ejercicio"
                    danger
                    icon={<Trash2 color={colors.danger} size={17} />}
                    onPress={() => removeExercise(routineExercise.id)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Agregar ejercicio</Text>
      <View style={styles.stack}>
        {availableExercises.map((exercise) => (
          <TouchableOpacity activeOpacity={0.75} key={exercise.id} onPress={() => addExercise(exercise.id)}>
            <Card>
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.muted}>{translateMuscleGroup(exercise.muscleGroup)}</Text>
                </View>
                <Plus color={colors.primary} size={20} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  stack: {
    gap: spacing.md,
  },
  exerciseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  exerciseCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
