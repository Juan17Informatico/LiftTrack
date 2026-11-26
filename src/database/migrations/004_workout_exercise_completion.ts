import type { DatabaseMigration } from './types';

export const workoutExerciseCompletionMigration: DatabaseMigration = {
  id: '004',
  name: 'workout_exercise_completion',
  up: 'ALTER TABLE workout_exercises ADD COLUMN completed INTEGER NOT NULL DEFAULT 0;',
};
