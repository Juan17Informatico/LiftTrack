import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useRepositories } from '@/hooks/useRepositories';
import type { WorkoutSessionDetail } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useWorkoutDetail(id: string | undefined) {
  const { workouts: workoutRepository } = useRepositories();
  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setSession(await workoutRepository.findById(id));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [id, workoutRepository]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { session, loading, error, reload };
}
