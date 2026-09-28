import type { DatabaseMigration } from './types';

export const initialSchemaMigration: DatabaseMigration = {
  id: '001',
  name: 'initial_schema',
  up: `
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      muscle_group TEXT NOT NULL,
      secondary_muscles TEXT,
      equipment TEXT,
      instructions TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS routine_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      target_sets INTEGER,
      min_reps INTEGER,
      max_reps INTEGER,
      rest_seconds INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT,
      name TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id TEXT PRIMARY KEY NOT NULL,
      workout_session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY NOT NULL,
      workout_exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL,
      repetitions INTEGER,
      duration_seconds INTEGER,
      distance_meters REAL,
      rir INTEGER,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
    CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id
      ON routine_exercises(routine_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise_id
      ON routine_exercises(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at
      ON workout_sessions(started_at DESC);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_finished_at
      ON workout_sessions(finished_at);
    CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id
      ON workout_exercises(workout_session_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id
      ON workout_exercises(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise_id
      ON workout_sets(workout_exercise_id, set_number);
  `,
};
