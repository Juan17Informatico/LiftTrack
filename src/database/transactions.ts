import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

export type TransactionExecutor = Pick<
  SQLiteDatabase,
  'execAsync' | 'getAllAsync' | 'getFirstAsync' | 'runAsync'
>;

export async function withWriteTransaction(
  db: SQLiteDatabase,
  task: (transaction: TransactionExecutor) => Promise<void>,
): Promise<void> {
  if (Platform.OS === 'web') {
    await db.withTransactionAsync(() => task(db));
    return;
  }

  await db.withExclusiveTransactionAsync((transaction) => task(transaction));
}
