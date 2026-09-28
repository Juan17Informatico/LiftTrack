import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { ExerciseRepository } from '@/database/repositories/exerciseRepository';
import { RoutineRepository } from '@/database/repositories/routineRepository';
import { WorkoutRepository } from '@/database/repositories/workoutRepository';

export function useRepositories() {
  const db = useSQLiteContext();

  return useMemo(
    () => ({
      exercises: new ExerciseRepository(db),
      routines: new RoutineRepository(db),
      workouts: new WorkoutRepository(db),
    }),
    [db],
  );
}
