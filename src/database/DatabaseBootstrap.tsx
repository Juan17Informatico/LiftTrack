import { PropsWithChildren, useEffect } from 'react';

import { useActiveWorkout } from '@/features/workouts/hooks/useActiveWorkout';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';

export function DatabaseBootstrap({ children }: PropsWithChildren) {
  const { session, loading, error } = useActiveWorkout();
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);

  useEffect(() => {
    if (!loading && !error) setActiveWorkoutId(session?.id ?? null);
  }, [error, loading, session?.id, setActiveWorkoutId]);

  return children;
}
