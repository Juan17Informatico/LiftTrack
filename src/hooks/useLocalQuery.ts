import { useQuery, type QueryKey } from '@tanstack/react-query';

import { localQueryOptions } from '@/database/localData';
import { getErrorMessage } from '@/utils/errors';

export function useLocalQuery<T>(queryKey: QueryKey, queryFn: () => Promise<T>, enabled = true) {
  const query = useQuery({ ...localQueryOptions, queryKey, queryFn, enabled });

  return {
    data: query.data,
    // Background changes retain the current screen and its unsaved input.
    loading: query.isLoading,
    error: query.error ? getErrorMessage(query.error) : null,
    reload: query.refetch,
  };
}
