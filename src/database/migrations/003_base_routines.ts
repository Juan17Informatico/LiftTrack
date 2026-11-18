import type { DatabaseMigration } from './types';

export const baseRoutinesMigration: DatabaseMigration = {
  id: '003',
  name: 'base_routines',
  up: 'ALTER TABLE workout_sessions ADD COLUMN base_routine_id TEXT;',
};
