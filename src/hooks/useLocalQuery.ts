import { useQuery, type QueryKey } from '@tanstack/react-query';

import { localQueryOptions } from '@/database/localData';
import { getErrorMessage } from '@/utils/errors';
import { useTranslation } from '@/i18n';

export function useLocalQuery<T>(queryKey: QueryKey, queryFn: () => Promise<T>, enabled = true) {
  const { t } = useTranslation();
  const query = useQuery({ ...localQueryOptions, queryKey, queryFn, enabled });

  return {
    data: query.data,
    // Background changes retain the current screen and its unsaved input.
    loading: query.isLoading,
    error: query.error ? t(getErrorMessage(query.error)) : null,
    reload: query.refetch,
  };
}
