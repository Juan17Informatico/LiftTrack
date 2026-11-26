import { create } from 'zustand';

type TimerStatus = 'idle' | 'running' | 'paused';

interface RestTimerState {
  status: TimerStatus;
  durationSeconds: number;
  remainingSeconds: number;
  startedAtMs: number | null;
  start: (durationSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
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

    const remainingSeconds = Math.max(
      0,
      state.durationSeconds - Math.floor((Date.now() - (state.startedAtMs ?? Date.now())) / 1000),
    );
    set({ status: remainingSeconds ? 'paused' : 'idle', remainingSeconds, startedAtMs: null });
  },

  resume: () => {
    const state = get();
    if (state.status === 'paused' && state.remainingSeconds > 0) {
      set({
        status: 'running',
        startedAtMs: Date.now() - (state.durationSeconds - state.remainingSeconds) * 1000,
      });
    }
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
