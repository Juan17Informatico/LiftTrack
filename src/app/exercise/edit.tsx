import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { ExerciseForm } from '@/features/exercises/components/ExerciseForm';
import { useExerciseDetail } from '@/features/exercises/hooks/useExerciseDetail';
import { useRepositories } from '@/hooks/useRepositories';
import type { ExerciseFormInput } from '@/schemas/exerciseSchemas';

export default function EditExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercise, loading, error } = useExerciseDetail(id);
  const { exercises } = useRepositories();
  async function save(input: ExerciseFormInput) {
    await exercises.update(id, input);
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/exercise/[id]', params: { id } });
  }
  return (
    <Screen title="Editar ejercicio" subtitle="Ajusta los detalles de tu biblioteca.">
      {loading ? <LoadingState label="Cargando ejercicio" /> : error || !exercise || exercise.deletedAt ? (
        <EmptyState title="Ejercicio no disponible" message={error ?? 'Este ejercicio ya no está en el catálogo.'} />
      ) : <ExerciseForm key={id} onSave={save} initialValues={{ name: exercise.name, muscleGroup: exercise.muscleGroup, equipment: exercise.equipment ?? '', instructions: exercise.instructions ?? '' }} />}
    </Screen>
  );
}
