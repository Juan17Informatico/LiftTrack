import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function useWorkoutHistory() {
  const { workouts: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(localKeys.history, () => repository.listHistory(), true);
  return { history: data ?? [], ...state };
}
