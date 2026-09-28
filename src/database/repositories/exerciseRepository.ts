import type { SQLiteDatabase } from 'expo-sqlite';

import { mapExerciseRow } from '@/database/repositories/mappers';
import type { Exercise, PreviousExerciseSet } from '@/types/domain';
import type { ExerciseRow, PreviousExerciseSetRow } from '@/types/sqlite';

export class ExerciseRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findAll(search?: string): Promise<Exercise[]> {
    try {
      const term = search?.trim();
      const rows = term
        ? await this.db.getAllAsync<ExerciseRow>(
            `
              SELECT *
              FROM exercises
              WHERE deleted_at IS NULL
                AND name LIKE ?
              ORDER BY name COLLATE NOCASE ASC
            `,
            `%${term}%`,
          )
        : await this.db.getAllAsync<ExerciseRow>(
            `
              SELECT *
              FROM exercises
              WHERE deleted_at IS NULL
              ORDER BY name COLLATE NOCASE ASC
            `,
          );

      return rows.map(mapExerciseRow);
    } catch (error) {
      console.error('ExerciseRepository.findAll failed', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    try {
      const row = await this.db.getFirstAsync<ExerciseRow>(
        'SELECT * FROM exercises WHERE id = ? AND deleted_at IS NULL',
        id,
      );

      return row ? mapExerciseRow(row) : null;
    } catch (error) {
      console.error('ExerciseRepository.findById failed', error);
      throw error;
    }
  }

  async findLastPerformance(exerciseId: string): Promise<PreviousExerciseSet[]> {
    try {
      const rows = await this.db.getAllAsync<PreviousExerciseSetRow>(
        `
          SELECT
            workout_sets.set_number,
            workout_sets.weight,
            workout_sets.repetitions,
            workout_sessions.started_at AS performed_at
          FROM workout_sets
          INNER JOIN workout_exercises
            ON workout_exercises.id = workout_sets.workout_exercise_id
          INNER JOIN workout_sessions
            ON workout_sessions.id = workout_exercises.workout_session_id
          WHERE workout_exercises.exercise_id = ?
            AND workout_sets.completed = 1
            AND workout_sets.deleted_at IS NULL
            AND workout_exercises.deleted_at IS NULL
            AND workout_sessions.deleted_at IS NULL
            AND workout_sessions.finished_at IS NOT NULL
            AND workout_sessions.id = (
              SELECT latest_session.id
              FROM workout_sessions AS latest_session
              INNER JOIN workout_exercises AS latest_exercise
                ON latest_exercise.workout_session_id = latest_session.id
              INNER JOIN workout_sets AS latest_set
                ON latest_set.workout_exercise_id = latest_exercise.id
              WHERE latest_exercise.exercise_id = ?
                AND latest_set.completed = 1
                AND latest_session.finished_at IS NOT NULL
                AND latest_session.deleted_at IS NULL
                AND latest_exercise.deleted_at IS NULL
                AND latest_set.deleted_at IS NULL
              ORDER BY latest_session.started_at DESC
              LIMIT 1
            )
          ORDER BY workout_sets.set_number ASC
        `,
        exerciseId,
        exerciseId,
      );

      return rows.map((row) => ({
        setNumber: row.set_number,
        weight: row.weight,
        repetitions: row.repetitions,
        performedAt: row.performed_at,
      }));
    } catch (error) {
      console.error('ExerciseRepository.findLastPerformance failed', error);
      throw error;
    }
  }
}
