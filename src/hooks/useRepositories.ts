import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { ExerciseRepository } from '@/database/repositories/exerciseRepository';
import { RoutineRepository } from '@/database/repositories/routineRepository';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';
import { refreshLocalData } from '@/database/localData';

export function useRepositories() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      exercises: new ExerciseRepository(db),
      routines: new RoutineRepository(db, () => refreshLocalData(queryClient, 'routines')),
      workouts: new WorkoutRepository(db, () => refreshLocalData(queryClient, 'workouts')),
    }),
    [db, queryClient],
  );
}
