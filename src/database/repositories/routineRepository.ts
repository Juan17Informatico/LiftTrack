import type { SQLiteDatabase } from 'expo-sqlite';

import {
  mapRoutineExerciseRow,
  mapRoutineListRow,
  mapRoutineRow,
} from '@/database/repositories/mappers';
import { withWriteTransaction } from '@/database/transactions';
import type {
  AddRoutineExerciseInput,
  RoutineFormInput,
} from '@/schemas/routineSchemas';
import type { Routine, RoutineExercise, RoutineSummary, RoutineWithExercises } from '@/types/domain';
import type { RoutineExerciseRow, RoutineListRow, RoutineRow } from '@/types/sqlite';
import { nowUtc } from '@/utils/date';
import { createId } from '@/utils/uuid';

export class RoutineRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<RoutineSummary[]> {
    try {
      const rows = await this.db.getAllAsync<RoutineListRow>(
        `
          SELECT
            routines.*,
            COUNT(routine_exercises.id) AS exercise_count
          FROM routines
          LEFT JOIN routine_exercises
            ON routine_exercises.routine_id = routines.id
            AND routine_exercises.deleted_at IS NULL
          WHERE routines.deleted_at IS NULL
          GROUP BY routines.id
          ORDER BY routines.updated_at DESC
        `,
      );

      return rows.map(mapRoutineListRow);
    } catch (error) {
      console.error('RoutineRepository.list failed', error);
      throw error;
    }
  }

  async create(input: RoutineFormInput): Promise<Routine> {
    try {
      const id = createId();
      const timestamp = nowUtc();
      const description = input.description?.trim() || null;

      await this.db.runAsync(
        `
          INSERT INTO routines (id, name, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        id,
        input.name.trim(),
        description,
        timestamp,
        timestamp,
      );

      const routine = await this.findById(id);
      if (!routine) {
        throw new Error('No se pudo crear la rutina');
      }

      return routine;
    } catch (error) {
      console.error('RoutineRepository.create failed', error);
      throw error;
    }
  }

  async update(id: string, input: RoutineFormInput): Promise<Routine> {
    try {
      await this.db.runAsync(
        `
          UPDATE routines
          SET name = ?, description = ?, updated_at = ?
          WHERE id = ? AND deleted_at IS NULL
        `,
        input.name.trim(),
        input.description?.trim() || null,
        nowUtc(),
        id,
      );

      const routine = await this.findById(id);
      if (!routine) {
        throw new Error('Rutina no encontrada despues de actualizar');
      }

      return routine;
    } catch (error) {
      console.error('RoutineRepository.update failed', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Routine | null> {
    try {
      const row = await this.db.getFirstAsync<RoutineRow>(
        'SELECT * FROM routines WHERE id = ? AND deleted_at IS NULL',
        id,
      );

      return row ? mapRoutineRow(row) : null;
    } catch (error) {
      console.error('RoutineRepository.findById failed', error);
      throw error;
    }
  }

  async findWithExercises(id: string): Promise<RoutineWithExercises | null> {
    const routine = await this.findById(id);
    if (!routine) {
      return null;
    }

    const exercises = await this.listRoutineExercises(id);
    return { ...routine, exercises };
  }

  async listRoutineExercises(routineId: string): Promise<RoutineExercise[]> {
    try {
      const rows = await this.db.getAllAsync<RoutineExerciseRow>(
        `
          SELECT
            routine_exercises.*,
            exercises.name AS exercise_name,
            exercises.muscle_group,
            exercises.secondary_muscles,
            exercises.equipment,
            exercises.instructions,
            exercises.created_at AS exercise_created_at,
            exercises.updated_at AS exercise_updated_at,
            exercises.deleted_at AS exercise_deleted_at
          FROM routine_exercises
          INNER JOIN exercises
            ON exercises.id = routine_exercises.exercise_id
          WHERE routine_exercises.routine_id = ?
            AND routine_exercises.deleted_at IS NULL
            AND exercises.deleted_at IS NULL
          ORDER BY routine_exercises.sort_order ASC
        `,
        routineId,
      );

      return rows.map(mapRoutineExerciseRow);
    } catch (error) {
      console.error('RoutineRepository.listRoutineExercises failed', error);
      throw error;
    }
  }

  async addExercise(routineId: string, input: AddRoutineExerciseInput): Promise<RoutineExercise> {
    try {
      const timestamp = nowUtc();
      const id = createId();

      await withWriteTransaction(this.db, async (transaction) => {
        const sortRow = await transaction.getFirstAsync<{ next_sort_order: number }>(
          `
            SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_sort_order
            FROM routine_exercises
            WHERE routine_id = ? AND deleted_at IS NULL
          `,
          routineId,
        );

        await transaction.runAsync(
          `
            INSERT INTO routine_exercises (
              id,
              routine_id,
              exercise_id,
              sort_order,
              target_sets,
              min_reps,
              max_reps,
              rest_seconds,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          id,
          routineId,
          input.exerciseId,
          sortRow?.next_sort_order ?? 0,
          input.targetSets ?? null,
          input.minReps ?? null,
          input.maxReps ?? null,
          input.restSeconds ?? null,
          timestamp,
          timestamp,
        );

        await transaction.runAsync('UPDATE routines SET updated_at = ? WHERE id = ?', timestamp, routineId);
      });

      const rows = await this.listRoutineExercises(routineId);
      const created = rows.find((row) => row.id === id);
      if (!created) {
        throw new Error('No se pudo agregar el ejercicio a la rutina');
      }

      return created;
    } catch (error) {
      console.error('RoutineRepository.addExercise failed', error);
      throw error;
    }
  }

  async removeExercise(routineExerciseId: string): Promise<void> {
    try {
      await withWriteTransaction(this.db, async (transaction) => {
        const row = await transaction.getFirstAsync<RoutineExerciseRow>(
          'SELECT * FROM routine_exercises WHERE id = ? AND deleted_at IS NULL',
          routineExerciseId,
        );

        if (!row) {
          return;
        }

        const timestamp = nowUtc();
        await transaction.runAsync(
          'UPDATE routine_exercises SET deleted_at = ?, updated_at = ? WHERE id = ?',
          timestamp,
          timestamp,
          routineExerciseId,
        );
        await transaction.runAsync(
          'UPDATE routines SET updated_at = ? WHERE id = ?',
          timestamp,
          row.routine_id,
        );
      });
    } catch (error) {
      console.error('RoutineRepository.removeExercise failed', error);
      throw error;
    }
  }

  async moveExercise(routineExerciseId: string, direction: 'up' | 'down'): Promise<void> {
    try {
      await withWriteTransaction(this.db, async (transaction) => {
        const current = await transaction.getFirstAsync<RoutineExerciseRow>(
          'SELECT * FROM routine_exercises WHERE id = ? AND deleted_at IS NULL',
          routineExerciseId,
        );

        if (!current) {
          return;
        }

        const comparator = direction === 'up' ? '<' : '>';
        const order = direction === 'up' ? 'DESC' : 'ASC';
        const neighbor = await transaction.getFirstAsync<RoutineExerciseRow>(
          `
            SELECT *
            FROM routine_exercises
            WHERE routine_id = ?
              AND deleted_at IS NULL
              AND sort_order ${comparator} ?
            ORDER BY sort_order ${order}
            LIMIT 1
          `,
          current.routine_id,
          current.sort_order,
        );

        if (!neighbor) {
          return;
        }

        const timestamp = nowUtc();
        await transaction.runAsync(
          'UPDATE routine_exercises SET sort_order = ?, updated_at = ? WHERE id = ?',
          neighbor.sort_order,
          timestamp,
          current.id,
        );
        await transaction.runAsync(
          'UPDATE routine_exercises SET sort_order = ?, updated_at = ? WHERE id = ?',
          current.sort_order,
          timestamp,
          neighbor.id,
        );
        await transaction.runAsync(
          'UPDATE routines SET updated_at = ? WHERE id = ?',
          timestamp,
          current.routine_id,
        );
      });
    } catch (error) {
      console.error('RoutineRepository.moveExercise failed', error);
      throw error;
    }
  }
}
