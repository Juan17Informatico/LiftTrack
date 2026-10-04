import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';
import { useMutation } from '@tanstack/react-query';

export function useWorkoutHistory() {
  const { workouts: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(localKeys.history, () => repository.listHistory(), true);
  const clear = useMutation({ mutationFn: () => repository.clearHistory(), networkMode: 'always' });
  return {
    history: data ?? [],
    clearHistory: clear.mutateAsync,
    clearing: clear.isPending,
    ...state,
  };
}
