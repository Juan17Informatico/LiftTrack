import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ExerciseForm } from '@/features/exercises/components/ExerciseForm';
import { useRepositories } from '@/hooks/useRepositories';
import type { ExerciseFormInput } from '@/schemas/exerciseSchemas';

export default function CreateExerciseScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { exercises } = useRepositories();
  async function save(input: ExerciseFormInput) {
    const exercise = await exercises.create(input);
    if (returnTo === 'previous' && router.canGoBack()) router.back();
    else router.replace({ pathname: '/exercise/[id]', params: { id: exercise.id } });
  }
  return <Screen title="Tu próximo movimiento" subtitle="Amplía tu biblioteca con un ejercicio a tu medida."><ExerciseForm onSave={save} /></Screen>;
}
