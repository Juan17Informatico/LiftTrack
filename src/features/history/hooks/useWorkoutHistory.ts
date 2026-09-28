import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { WorkoutHistoryItem } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useWorkoutHistory() {
  const { workouts: workoutRepository } = useRepositories();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHistory(await workoutRepository.listHistory());
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [workoutRepository]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { history, loading, error, reload };
}
