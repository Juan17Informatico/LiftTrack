import { useCallback } from 'react';

import type { UpdateWorkoutSetInput } from '@/database/repositories/workoutRepository';
import { useActiveWorkout } from '@/features/workouts/hooks/useActiveWorkout';
import { useRepositories } from '@/hooks/useRepositories';

export function useActiveWorkoutSession() {
  const { workouts: repository } = useRepositories();
  const state = useActiveWorkout();
  const sessionId = state.session?.id;

  const addSet = useCallback(
    async (exerciseId: string) => {
      await repository.addSet(exerciseId);
    },
    [repository],
  );

  const updateSet = useCallback(
    async (id: string, input: UpdateWorkoutSetInput) => {
      await repository.updateSet(id, input);
    },
    [repository],
  );

  const deleteSet = useCallback(
    async (id: string) => {
      await repository.deleteSet(id);
    },
    [repository],
  );

  const addExercise = useCallback(
    async (exerciseId: string) => {
      if (sessionId) await repository.addExerciseToSession(sessionId, exerciseId);
    },
    [repository, sessionId],
  );

  const finish = useCallback(async () => {
    return sessionId ? repository.finishSession(sessionId) : null;
  }, [repository, sessionId]);

  return { ...state, addSet, updateSet, deleteSet, addExercise, finish };
}
