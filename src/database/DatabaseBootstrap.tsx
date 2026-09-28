import { PropsWithChildren, useEffect } from 'react';

import { useRepositories } from '@/hooks/useRepositories';
import { useActiveWorkoutStore } from '@/store/activeWorkoutStore';

export function DatabaseBootstrap({ children }: PropsWithChildren) {
  const { workouts } = useRepositories();
  const setActiveWorkoutId = useActiveWorkoutStore((state) => state.setActiveWorkoutId);

  useEffect(() => {
    let mounted = true;

    async function hydrateActiveWorkout() {
      try {
        const active = await workouts.findActive();
        if (mounted) {
          setActiveWorkoutId(active?.id ?? null);
        }
      } catch (error) {
        console.error('No se pudo hidratar el entrenamiento activo', error);
      }
    }

    hydrateActiveWorkout();

    return () => {
      mounted = false;
    };
  }, [setActiveWorkoutId, workouts]);

  return children;
}
