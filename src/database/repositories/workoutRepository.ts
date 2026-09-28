import type { SQLiteDatabase } from 'expo-sqlite';

import {
  mapWorkoutExerciseRow,
  mapWorkoutHistoryRow,
  mapWorkoutSessionRow,
  mapWorkoutSetRow,
} from '@/database/repositories/mappers';
import { withWriteTransaction } from '@/database/transactions';
import type {
  WorkoutExercise,
  WorkoutHistoryItem,
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSet,
} from '@/types/domain';
import type {
  RoutineExerciseRow,
  RoutineRow,
  WorkoutExerciseRow,
  WorkoutHistoryRow,
  WorkoutSessionRow,
  WorkoutSetRow,
} from '@/types/sqlite';
import { nowUtc } from '@/utils/date';
import { createId } from '@/utils/uuid';

export interface UpdateWorkoutSetInput {
  weight: number | null;
  repetitions: number | null;
  completed: boolean;
}

export class WorkoutRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async findActive(): Promise<WorkoutSessionDetail | null> {
    try {
      const row = await this.db.getFirstAsync<WorkoutSessionRow>(
        `
          SELECT
            workout_sessions.*,
            routines.name AS routine_name
          FROM workout_sessions
          LEFT JOIN routines
            ON routines.id = workout_sessions.routine_id
          WHERE workout_sessions.finished_at IS NULL
            AND workout_sessions.deleted_at IS NULL
          ORDER BY workout_sessions.started_at DESC
          LIMIT 1
        `,
      );

      return row ? this.findById(row.id) : null;
    } catch (error) {
      console.error('WorkoutRepository.findActive failed', error);
      throw error;
    }
  }

  async findById(id: string): Promise<WorkoutSessionDetail | null> {
    try {
      const row = await this.db.getFirstAsync<WorkoutSessionRow>(
        `
          SELECT
            workout_sessions.*,
            routines.name AS routine_name
          FROM workout_sessions
          LEFT JOIN routines
            ON routines.id = workout_sessions.routine_id
          WHERE workout_sessions.id = ?
            AND workout_sessions.deleted_at IS NULL
        `,
        id,
      );

      if (!row) {
        return null;
      }

      const exercises = await this.listWorkoutExercises(id);

      return {
        ...mapWorkoutSessionRow(row),
        routineName: row.routine_name ?? null,
        exercises,
      };
    } catch (error) {
      console.error('WorkoutRepository.findById failed', error);
      throw error;
    }
  }

  async listHistory(limit = 30): Promise<WorkoutHistoryItem[]> {
    try {
      const rows = await this.db.getAllAsync<WorkoutHistoryRow>(
        `
          SELECT
            workout_sessions.*,
            routines.name AS routine_name,
            COUNT(DISTINCT workout_exercises.id) AS exercise_count,
            COUNT(
              DISTINCT CASE
                WHEN workout_sets.completed = 1 THEN workout_sets.id
              END
            ) AS completed_set_count
          FROM workout_sessions
          LEFT JOIN routines
            ON routines.id = workout_sessions.routine_id
          LEFT JOIN workout_exercises
            ON workout_exercises.workout_session_id = workout_sessions.id
            AND workout_exercises.deleted_at IS NULL
          LEFT JOIN workout_sets
            ON workout_sets.workout_exercise_id = workout_exercises.id
            AND workout_sets.deleted_at IS NULL
          WHERE workout_sessions.finished_at IS NOT NULL
            AND workout_sessions.deleted_at IS NULL
          GROUP BY workout_sessions.id
          ORDER BY workout_sessions.started_at DESC
          LIMIT ?
        `,
        limit,
      );

      return rows.map(mapWorkoutHistoryRow);
    } catch (error) {
      console.error('WorkoutRepository.listHistory failed', error);
      throw error;
    }
  }

  async startFromRoutine(routineId: string): Promise<WorkoutSession> {
    try {
      const sessionId = createId();
      const timestamp = nowUtc();

      await withWriteTransaction(this.db, async (transaction) => {
        const routine = await transaction.getFirstAsync<RoutineRow>(
          'SELECT * FROM routines WHERE id = ? AND deleted_at IS NULL',
          routineId,
        );

        if (!routine) {
          throw new Error('Rutina no encontrada');
        }

        await transaction.runAsync(
          `
            INSERT INTO workout_sessions (
              id,
              routine_id,
              name,
              started_at,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          sessionId,
          routine.id,
          routine.name,
          timestamp,
          timestamp,
          timestamp,
        );

        const routineExercises = await transaction.getAllAsync<RoutineExerciseRow>(
          `
            SELECT *
            FROM routine_exercises
            WHERE routine_id = ?
              AND deleted_at IS NULL
            ORDER BY sort_order ASC
          `,
          routineId,
        );

        for (const routineExercise of routineExercises) {
          await transaction.runAsync(
            `
              INSERT INTO workout_exercises (
                id,
                workout_session_id,
                exercise_id,
                sort_order,
                created_at,
                updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?)
            `,
            createId(),
            sessionId,
            routineExercise.exercise_id,
            routineExercise.sort_order,
            timestamp,
            timestamp,
          );
        }
      });

      const created = await this.findById(sessionId);
      if (!created) {
        throw new Error('No se pudo crear el entrenamiento');
      }

      return created;
    } catch (error) {
      console.error('WorkoutRepository.startFromRoutine failed', error);
      throw error;
    }
  }

  async startEmpty(name = 'Entrenamiento libre'): Promise<WorkoutSession> {
    try {
      const id = createId();
      const timestamp = nowUtc();

      await this.db.runAsync(
        `
          INSERT INTO workout_sessions (id, name, started_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        id,
        name,
        timestamp,
        timestamp,
        timestamp,
      );

      const created = await this.findById(id);
      if (!created) {
        throw new Error('No se pudo crear el entrenamiento');
      }

      return created;
    } catch (error) {
      console.error('WorkoutRepository.startEmpty failed', error);
      throw error;
    }
  }

  async addExerciseToSession(sessionId: string, exerciseId: string): Promise<WorkoutExercise> {
    try {
      const id = createId();
      const timestamp = nowUtc();

      await withWriteTransaction(this.db, async (transaction) => {
        const sortRow = await transaction.getFirstAsync<{ next_sort_order: number }>(
          `
            SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
            FROM workout_exercises
            WHERE workout_session_id = ? AND deleted_at IS NULL
          `,
          sessionId,
        );

        await transaction.runAsync(
          `
            INSERT INTO workout_exercises (
              id,
              workout_session_id,
              exercise_id,
              sort_order,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          id,
          sessionId,
          exerciseId,
          sortRow?.next_sort_order ?? 0,
          timestamp,
          timestamp,
        );

        await transaction.runAsync(
          'UPDATE workout_sessions SET updated_at = ? WHERE id = ?',
          timestamp,
          sessionId,
        );
      });

      const exercises = await this.listWorkoutExercises(sessionId);
      const created = exercises.find((exercise) => exercise.id === id);
      if (!created) {
        throw new Error('No se pudo crear el ejercicio del entrenamiento');
      }

      return created;
    } catch (error) {
      console.error('WorkoutRepository.addExerciseToSession failed', error);
      throw error;
    }
  }

  async addSet(workoutExerciseId: string): Promise<WorkoutSet> {
    try {
      const id = createId();
      const timestamp = nowUtc();

      await withWriteTransaction(this.db, async (transaction) => {
        const row = await transaction.getFirstAsync<{ next_set_number: number }>(
          `
            SELECT COALESCE(MAX(set_number), 0) + 1 AS next_set_number
            FROM workout_sets
            WHERE workout_exercise_id = ? AND deleted_at IS NULL
          `,
          workoutExerciseId,
        );

        await transaction.runAsync(
          `
            INSERT INTO workout_sets (
              id,
              workout_exercise_id,
              set_number,
              weight,
              repetitions,
              duration_seconds,
              distance_meters,
              rir,
              completed,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, NULL, NULL, NULL, NULL, NULL, 0, ?, ?)
          `,
          id,
          workoutExerciseId,
          row?.next_set_number ?? 1,
          timestamp,
          timestamp,
        );
      });

      const set = await this.findSetById(id);
      if (!set) {
        throw new Error('No se pudo crear la serie');
      }

      return set;
    } catch (error) {
      console.error('WorkoutRepository.addSet failed', error);
      throw error;
    }
  }

  async updateSet(id: string, input: UpdateWorkoutSetInput): Promise<WorkoutSet> {
    try {
      await this.db.runAsync(
        `
          UPDATE workout_sets
          SET weight = ?,
              repetitions = ?,
              completed = ?,
              updated_at = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
        input.weight,
        input.repetitions,
        input.completed ? 1 : 0,
        nowUtc(),
        id,
      );

      const set = await this.findSetById(id);
      if (!set) {
        throw new Error('Serie no encontrada despues de actualizar');
      }

      return set;
    } catch (error) {
      console.error('WorkoutRepository.updateSet failed', error);
      throw error;
    }
  }

  async deleteSet(id: string): Promise<void> {
    try {
      const timestamp = nowUtc();
      await this.db.runAsync(
        'UPDATE workout_sets SET deleted_at = ?, updated_at = ? WHERE id = ?',
        timestamp,
        timestamp,
        id,
      );
    } catch (error) {
      console.error('WorkoutRepository.deleteSet failed', error);
      throw error;
    }
  }

  async finishSession(sessionId: string): Promise<WorkoutSessionDetail> {
    try {
      const timestamp = nowUtc();
      await this.db.runAsync(
        `
          UPDATE workout_sessions
          SET finished_at = ?, updated_at = ?
          WHERE id = ?
            AND finished_at IS NULL
            AND deleted_at IS NULL
        `,
        timestamp,
        timestamp,
        sessionId,
      );

      const finished = await this.findById(sessionId);
      if (!finished) {
        throw new Error('Entrenamiento no encontrado despues de finalizar');
      }

      return finished;
    } catch (error) {
      console.error('WorkoutRepository.finishSession failed', error);
      throw error;
    }
  }

  private async listWorkoutExercises(sessionId: string): Promise<WorkoutExercise[]> {
    const exerciseRows = await this.db.getAllAsync<WorkoutExerciseRow>(
      `
        SELECT
          workout_exercises.*,
          exercises.name AS exercise_name,
          exercises.muscle_group,
          exercises.secondary_muscles,
          exercises.equipment,
          exercises.instructions,
          exercises.created_at AS exercise_created_at,
          exercises.updated_at AS exercise_updated_at,
          exercises.deleted_at AS exercise_deleted_at
        FROM workout_exercises
        INNER JOIN exercises
          ON exercises.id = workout_exercises.exercise_id
        WHERE workout_exercises.workout_session_id = ?
          AND workout_exercises.deleted_at IS NULL
          AND exercises.deleted_at IS NULL
        ORDER BY workout_exercises.sort_order ASC
      `,
      sessionId,
    );

    if (exerciseRows.length === 0) {
      return [];
    }

    const placeholders = exerciseRows.map(() => '?').join(', ');
    const setRows = await this.db.getAllAsync<WorkoutSetRow>(
      `
        SELECT *
        FROM workout_sets
        WHERE deleted_at IS NULL
          AND workout_exercise_id IN (${placeholders})
        ORDER BY workout_exercise_id ASC, set_number ASC
      `,
      exerciseRows.map((row) => row.id),
    );

    const setsByExerciseId = new Map<string, WorkoutSet[]>();
    for (const setRow of setRows) {
      const set = mapWorkoutSetRow(setRow);
      const existing = setsByExerciseId.get(set.workoutExerciseId) ?? [];
      existing.push(set);
      setsByExerciseId.set(set.workoutExerciseId, existing);
    }

    return exerciseRows.map((row) => mapWorkoutExerciseRow(row, setsByExerciseId.get(row.id) ?? []));
  }

  private async findSetById(id: string): Promise<WorkoutSet | null> {
    const row = await this.db.getFirstAsync<WorkoutSetRow>(
      'SELECT * FROM workout_sets WHERE id = ? AND deleted_at IS NULL',
      id,
    );

    return row ? mapWorkoutSetRow(row) : null;
  }
}
