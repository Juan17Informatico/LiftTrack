import { initialSchemaMigration } from './001_initial_schema';
import { spanishExerciseInstructionsMigration } from './002_spanish_exercise_instructions';
import type { DatabaseMigration } from './types';

export const migrations: DatabaseMigration[] = [initialSchemaMigration, spanishExerciseInstructionsMigration];
