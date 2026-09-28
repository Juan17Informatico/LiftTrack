import { create } from 'zustand';

interface ActiveWorkoutState {
  activeWorkoutId: string | null;
  setActiveWorkoutId: (id: string | null) => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set) => ({
  activeWorkoutId: null,
  setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),
}));
