import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import type { UpdateWorkoutSetInput } from '@/database/repositories/workoutRepository';
import { useRepositories } from '@/hooks/useRepositories';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';
import type { WorkoutSessionDetail } from '@/types/domain';
import { getErrorMessage } from '@/utils/errors';

export function useActiveWorkoutSession() {
  const { workouts: workoutRepository } = useRepositories();
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);
  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const active = await workoutRepository.findActive();
      setSession(active);
      setActiveWorkoutId(active?.id ?? null);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [setActiveWorkoutId, workoutRepository]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const addSet = useCallback(
    async (workoutExerciseId: string) => {
      await workoutRepository.addSet(workoutExerciseId);
      await reload();
    },
    [reload, workoutRepository],
  );

  const updateSet = useCallback(
    async (setId: string, input: UpdateWorkoutSetInput) => {
      await workoutRepository.updateSet(setId, input);
      await reload();
    },
    [reload, workoutRepository],
  );

  const deleteSet = useCallback(
    async (setId: string) => {
      await workoutRepository.deleteSet(setId);
      await reload();
    },
    [reload, workoutRepository],
  );

  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (!session) {
        return;
      }

      await workoutRepository.addExerciseToSession(session.id, exerciseId);
      await reload();
    },
    [reload, session, workoutRepository],
  );

  const finish = useCallback(async () => {
    if (!session) {
      return null;
    }

    const finished = await workoutRepository.finishSession(session.id);
    setSession(null);
    setActiveWorkoutId(null);
    return finished;
  }, [session, setActiveWorkoutId, workoutRepository]);

  return { session, loading, error, reload, addSet, updateSet, deleteSet, addExercise, finish };
}
