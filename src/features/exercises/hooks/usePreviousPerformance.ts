import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function usePreviousPerformance(id: string | undefined) {
  const { exercises: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(
    localKeys.performance(id),
    () => (id ? repository.findLastPerformance(id) : Promise.resolve([])),
    !!id,
  );
  return { sets: data ?? [], ...state };
}
