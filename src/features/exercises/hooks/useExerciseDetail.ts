import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { Exercise, PreviousExerciseSet } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useExerciseDetail(id: string | undefined) {
  const { exercises: exerciseRepository } = useRepositories();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [previousSets, setPreviousSets] = useState<PreviousExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [exerciseResult, previousResult] = await Promise.all([
        exerciseRepository.findById(id),
        exerciseRepository.findLastPerformance(id),
      ]);
      setExercise(exerciseResult);
      setPreviousSets(previousResult);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [exerciseRepository, id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { exercise, previousSets, loading, error, reload };
}
