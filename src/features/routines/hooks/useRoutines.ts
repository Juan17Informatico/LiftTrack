import { localKeys } from '@/database/localData';
import { useLocalQuery } from '@/hooks/useLocalQuery';
import { useRepositories } from '@/hooks/useRepositories';

export function useRoutines() {
  const { routines: repository } = useRepositories();
  const { data, ...state } = useLocalQuery(localKeys.routineList, () => repository.list(), true);
  return { routines: data ?? [], ...state };
}
