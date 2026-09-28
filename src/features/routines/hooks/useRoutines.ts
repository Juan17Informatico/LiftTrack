import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { RoutineSummary } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useRoutines() {
  const { routines: routineRepository } = useRepositories();
  const [routines, setRoutines] = useState<RoutineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoutines(await routineRepository.list());
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [routineRepository]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { routines, loading, error, reload };
}
