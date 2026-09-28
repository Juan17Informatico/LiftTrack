import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { Exercise } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useExerciseCatalog(search?: string) {
  const { exercises: exerciseRepository } = useRepositories();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setExercises(await exerciseRepository.findAll(search));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [exerciseRepository, search]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { exercises, loading, error, reload };
}
