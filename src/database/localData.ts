import type { QueryClient } from '@tanstack/react-query';

export const localQueryOptions = {
  networkMode: 'always' as const,
  staleTime: Infinity,
  retry: false,
};

export const localKeys = {
  routines: ['local', 'routines'] as const,
  routineList: ['local', 'routines', 'list'] as const,
  routine: (id: string | undefined) => ['local', 'routines', 'detail', id] as const,
  workouts: ['local', 'workouts'] as const,
  activeWorkout: ['local', 'workouts', 'active'] as const,
  history: ['local', 'workouts', 'history'] as const,
  workout: (id: string | undefined) => ['local', 'workouts', 'detail', id] as const,
  exercises: (search = '') => ['local', 'exercises', 'list', search.trim()] as const,
  exerciseCatalog: ['local', 'exercises'] as const,
  exercise: (id: string | undefined) => ['local', 'exercises', 'detail', id] as const,
  performances: ['local', 'performances'] as const,
  performance: (id: string | undefined) => ['local', 'performances', id] as const,
};

export type DataChangeListener = () => Promise<void>;

export async function refreshLocalData(
  client: QueryClient,
  domain: 'routines' | 'workouts' | 'exercises',
): Promise<void> {
  // Workout queries also join routine names; a rename must update those views.
  const keys =
    domain === 'exercises'
      ? [localKeys.exerciseCatalog, localKeys.routines, localKeys.workouts, localKeys.performances]
      : domain === 'routines'
      ? [localKeys.routines, localKeys.workouts]
      : [localKeys.workouts, localKeys.performances];

  // Discard reads started before the write so an older snapshot cannot win a race.
  await Promise.all(keys.map((queryKey) => client.cancelQueries({ queryKey })));
  await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
}
