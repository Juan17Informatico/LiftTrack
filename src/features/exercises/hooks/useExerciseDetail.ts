import { localKeys } from '@/database/localData';
import { usePreviousPerformance } from '@/features/exercises/hooks/usePreviousPerformance';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function useExerciseDetail(id: string | undefined) {
  const { exercises: repository } = useRepositories();
  const query = useLocalQuery(
    localKeys.exercise(id),
    () => (id ? repository.findById(id, true) : Promise.resolve(null)),
    !!id,
  );
  const performance = usePreviousPerformance(id);
  return {
    exercise: query.data ?? null,
    previousSets: performance.sets,
    loading: query.loading || performance.loading,
    error: query.error ?? performance.error,
  };
}
