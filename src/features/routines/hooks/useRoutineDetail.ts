import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function useRoutineDetail(id: string | undefined) {
  const { routines: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(
    localKeys.routine(id),
    () => (id ? repository.findWithExercises(id) : Promise.resolve(null)),
    !!id,
  );
  return { routine: data ?? null, ...state };
}
