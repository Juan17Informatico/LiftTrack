import type { SQLiteDatabase } from 'expo-sqlite';
import type { DataChangeListener } from '@/database/localData';
import { withWriteTransaction } from '@/database/transactions';
import { exerciseFormSchema, type ExerciseFormInput } from '@/schemas/exerciseSchemas';
import { nowUtc } from '@/utils/date';
import { createId } from '@/utils/uuid';

import { mapExerciseRow } from '@/database/repositories/mappers';
import type { Exercise, PreviousExerciseSet } from '@/types/domain';
import type { ExerciseRow, PreviousExerciseSetRow } from '@/types/sqlite';

export class ExerciseRepository {
  constructor(private readonly db: SQLiteDatabase, private readonly onChange?: DataChangeListener) {}

  async create(input: ExerciseFormInput): Promise<Exercise> {
    const values = exerciseFormSchema.parse(input);
    const id = createId();
    const timestamp = nowUtc();
    await this.db.runAsync(
      `INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, instructions, created_at, updated_at)
       VALUES (?, ?, ?, '[]', ?, ?, ?, ?)`,
      id, values.name, values.muscleGroup, values.equipment || null, values.instructions || null,
      timestamp, timestamp,
    );
    const created = await this.findById(id);
    if (!created) throw new Error('No se pudo crear el ejercicio.');
    await this.onChange?.();
    return created;
  }

  async update(id: string, input: ExerciseFormInput): Promise<Exercise> {
    const values = exerciseFormSchema.parse(input);
    const result = await this.db.runAsync(
      `UPDATE exercises SET name = ?, muscle_group = ?, equipment = ?, instructions = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
      values.name, values.muscleGroup, values.equipment || null, values.instructions || null, nowUtc(), id,
    );
    if (!result.changes) throw new Error('Este ejercicio ya no está disponible.');
    const updated = await this.findById(id);
    if (!updated) throw new Error('No se pudo actualizar el ejercicio.');
    await this.onChange?.();
    return updated;
  }

  async delete(id: string): Promise<void> {
    const timestamp = nowUtc();
    await withWriteTransaction(this.db, async (transaction) => {
      await transaction.runAsync(
        `UPDATE routines SET updated_at = ? WHERE id IN
         (SELECT routine_id FROM routine_exercises WHERE exercise_id = ? AND deleted_at IS NULL)`,
        timestamp, id,
      );
      await transaction.runAsync(
        'UPDATE routine_exercises SET deleted_at = ?, updated_at = ? WHERE exercise_id = ? AND deleted_at IS NULL',
        timestamp, timestamp, id,
      );
      // Keep the row and workout links so recorded sets retain their exercise details.
      await transaction.runAsync(
        'UPDATE exercises SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
        timestamp, timestamp, id,
      );
    });
    await this.onChange?.();
  }

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

  async findById(id: string, includeDeleted = false): Promise<Exercise | null> {
    try {
      const row = await this.db.getFirstAsync<ExerciseRow>(
        `SELECT * FROM exercises WHERE id = ? ${includeDeleted ? '' : 'AND deleted_at IS NULL'}`,
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
