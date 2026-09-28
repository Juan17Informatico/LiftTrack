import type {
  Exercise,
  Routine,
  RoutineExercise,
  RoutineSummary,
  WorkoutExercise,
  WorkoutHistoryItem,
  WorkoutSession,
  WorkoutSet,
} from '@/types/domain';
import type {
  ExerciseRow,
  RoutineExerciseRow,
  RoutineListRow,
  RoutineRow,
  WorkoutExerciseRow,
  WorkoutHistoryRow,
  WorkoutSessionRow,
  WorkoutSetRow,
} from '@/types/sqlite';

function parseSecondaryMuscles(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    secondaryMuscles: parseSecondaryMuscles(row.secondary_muscles),
    equipment: row.equipment,
    instructions: row.instructions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapRoutineRow(row: RoutineRow): Routine {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapRoutineListRow(row: RoutineListRow): RoutineSummary {
  return {
    ...mapRoutineRow(row),
    exerciseCount: row.exercise_count,
  };
}

export function mapRoutineExerciseRow(row: RoutineExerciseRow): RoutineExercise {
  const exercise =
    row.exercise_name && row.muscle_group
      ? {
          id: row.exercise_id,
          name: row.exercise_name,
          muscleGroup: row.muscle_group,
          secondaryMuscles: parseSecondaryMuscles(row.secondary_muscles),
          equipment: row.equipment ?? null,
          instructions: row.instructions ?? null,
          createdAt: row.exercise_created_at ?? row.created_at,
          updatedAt: row.exercise_updated_at ?? row.updated_at,
          deletedAt: row.exercise_deleted_at ?? null,
        }
      : undefined;

  return {
    id: row.id,
    routineId: row.routine_id,
    exerciseId: row.exercise_id,
    sortOrder: row.sort_order,
    targetSets: row.target_sets,
    minReps: row.min_reps,
    maxReps: row.max_reps,
    restSeconds: row.rest_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    exercise,
  };
}

export function mapWorkoutSessionRow(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: row.id,
    routineId: row.routine_id,
    name: row.name,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export function mapWorkoutHistoryRow(row: WorkoutHistoryRow): WorkoutHistoryItem {
  return {
    ...mapWorkoutSessionRow(row),
    routineName: row.routine_name ?? null,
    exerciseCount: row.exercise_count,
    completedSetCount: row.completed_set_count,
  };
}

export function mapWorkoutExerciseRow(row: WorkoutExerciseRow, sets: WorkoutSet[] = []): WorkoutExercise {
  const exercise =
    row.exercise_name && row.muscle_group
      ? {
          id: row.exercise_id,
          name: row.exercise_name,
          muscleGroup: row.muscle_group,
          secondaryMuscles: parseSecondaryMuscles(row.secondary_muscles),
          equipment: row.equipment ?? null,
          instructions: row.instructions ?? null,
          createdAt: row.exercise_created_at ?? row.created_at,
          updatedAt: row.exercise_updated_at ?? row.updated_at,
          deletedAt: row.exercise_deleted_at ?? null,
        }
      : undefined;

  return {
    id: row.id,
    workoutSessionId: row.workout_session_id,
    exerciseId: row.exercise_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    exercise,
    sets,
  };
}

export function mapWorkoutSetRow(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutExerciseId: row.workout_exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    repetitions: row.repetitions,
    durationSeconds: row.duration_seconds,
    distanceMeters: row.distance_meters,
    rir: row.rir,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}
