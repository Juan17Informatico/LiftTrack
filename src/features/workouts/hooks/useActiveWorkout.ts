import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function useActiveWorkout() {
  const { workouts: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(
    localKeys.activeWorkout,
    () => repository.findActive(),
    true,
  );
  return { session: data ?? null, ...state };
}
