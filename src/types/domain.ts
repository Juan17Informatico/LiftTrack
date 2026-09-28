export type ISODateString = string;
export type WeightUnit = 'kg' | 'lb';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  equipment: string | null;
  instructions: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
}

export interface RoutineSummary extends Routine {
  exerciseCount: number;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  sortOrder: number;
  targetSets: number | null;
  minReps: number | null;
  maxReps: number | null;
  restSeconds: number | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  exercise?: Exercise;
}

export interface RoutineWithExercises extends Routine {
  exercises: RoutineExercise[];
}

export interface WorkoutSession {
  id: string;
  routineId: string | null;
  name: string;
  startedAt: ISODateString;
  finishedAt: ISODateString | null;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
}

export interface WorkoutExercise {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  exercise?: Exercise;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number | null;
  repetitions: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rir: number | null;
  completed: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
}

export interface WorkoutSessionDetail extends WorkoutSession {
  routineName: string | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutHistoryItem extends WorkoutSession {
  routineName: string | null;
  exerciseCount: number;
  completedSetCount: number;
}

export interface PreviousExerciseSet {
  setNumber: number;
  weight: number | null;
  repetitions: number | null;
  performedAt: ISODateString;
}
