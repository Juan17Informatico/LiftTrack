import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { RoutineWithExercises } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useRoutineDetail(id: string | undefined) {
  const { routines: routineRepository } = useRepositories();
  const [routine, setRoutine] = useState<RoutineWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setRoutine(await routineRepository.findWithExercises(id));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [routineRepository, id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { routine, loading, error, reload };
}
