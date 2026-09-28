import { create } from 'zustand';

type TimerStatus = 'idle' | 'running' | 'paused';

interface RestTimerState {
  status: TimerStatus;
  durationSeconds: number;
  remainingSeconds: number;
  startedAtMs: number | null;
  start: (durationSeconds?: number) => void;
  pause: () => void;
  cancel: () => void;
  tick: () => void;
}

const DEFAULT_REST_SECONDS = 90;

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  status: 'idle',
  durationSeconds: DEFAULT_REST_SECONDS,
  remainingSeconds: 0,
  startedAtMs: null,

  start: (durationSeconds = DEFAULT_REST_SECONDS) =>
    set({
      status: 'running',
      durationSeconds,
      remainingSeconds: durationSeconds,
      startedAtMs: Date.now(),
    }),

  pause: () => {
    const state = get();
    if (state.status !== 'running') {
      return;
    }

    set({ status: 'paused', startedAtMs: null });
  },

  cancel: () =>
    set({
      status: 'idle',
      remainingSeconds: 0,
      startedAtMs: null,
    }),

  tick: () => {
    const state = get();
    if (state.status !== 'running' || state.startedAtMs === null) {
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - state.startedAtMs) / 1000);
    const remainingSeconds = Math.max(0, state.durationSeconds - elapsedSeconds);

    set({
      remainingSeconds,
      status: remainingSeconds === 0 ? 'idle' : 'running',
      startedAtMs: remainingSeconds === 0 ? null : state.startedAtMs,
    });
  },
}));
