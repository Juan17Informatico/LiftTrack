import { useEffect } from 'react';

import { useRestTimerStore } from '@/store/restTimerStore';

export function useRestTimer() {
  const timer = useRestTimerStore();

  useEffect(() => {
    if (timer.status !== 'running') {
      return undefined;
    }

    const intervalId = setInterval(() => {
      useRestTimerStore.getState().tick();
    }, 500);

    return () => clearInterval(intervalId);
  }, [timer.status]);

  return timer;
}
