export interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string | null;
  equipment: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoutineListRow extends RoutineRow {
  exercise_count: number;
}

export interface RoutineExerciseRow {
  id: string;
  routine_id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number | null;
  min_reps: number | null;
  max_reps: number | null;
  rest_seconds: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  exercise_name?: string;
  muscle_group?: string;
  secondary_muscles?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  exercise_created_at?: string;
  exercise_updated_at?: string;
  exercise_deleted_at?: string | null;
}

export interface WorkoutSessionRow {
  id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  routine_name?: string | null;
}

export interface WorkoutHistoryRow extends WorkoutSessionRow {
  exercise_count: number;
  completed_set_count: number;
}

export interface WorkoutExerciseRow {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  exercise_name?: string;
  muscle_group?: string;
  secondary_muscles?: string | null;
  equipment?: string | null;
  instructions?: string | null;
  exercise_created_at?: string;
  exercise_updated_at?: string;
  exercise_deleted_at?: string | null;
}

export interface WorkoutSetRow {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight: number | null;
  repetitions: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rir: number | null;
  completed: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PreviousExerciseSetRow {
  set_number: number;
  weight: number | null;
  repetitions: number | null;
  performed_at: string;
}
