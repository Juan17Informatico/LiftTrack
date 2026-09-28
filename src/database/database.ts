import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from '@/database/migrations';
import { exerciseSeed } from '@/database/seed/exercises';
import { nowUtc } from '@/utils/date';

export const DATABASE_NAME = 'lifttrack.db';

interface MigrationRow {
  id: string;
}

interface CountRow {
  count: number;
}

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  await ensureMigrationsTable(db);
  await applyPendingMigrations(db);
  await seedInitialExercises(db);
}

async function ensureMigrationsTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      run_at TEXT NOT NULL
    );
  `);
}

async function applyPendingMigrations(db: SQLiteDatabase): Promise<void> {
  const applied = await db.getAllAsync<MigrationRow>('SELECT id FROM migrations');
  const appliedIds = new Set(applied.map((migration) => migration.id));

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
      await db.runAsync(
        'INSERT INTO migrations (id, name, run_at) VALUES (?, ?, ?)',
        migration.id,
        migration.name,
        nowUtc(),
      );
    });
  }
}

async function seedInitialExercises(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<CountRow>(
    'SELECT COUNT(*) AS count FROM exercises WHERE deleted_at IS NULL',
  );

  if ((row?.count ?? 0) >= exerciseSeed.length) {
    return;
  }

  const timestamp = nowUtc();

  await db.withTransactionAsync(async () => {
    for (const exercise of exerciseSeed) {
      await db.runAsync(
        `
          INSERT OR IGNORE INTO exercises (
            id,
            name,
            muscle_group,
            secondary_muscles,
            equipment,
            instructions,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        exercise.id,
        exercise.name,
        exercise.muscleGroup,
        JSON.stringify(exercise.secondaryMuscles),
        exercise.equipment,
        exercise.instructions,
        timestamp,
        timestamp,
      );
    }
  });
}
