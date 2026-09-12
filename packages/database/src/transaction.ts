import { AsyncLocalStorage } from 'node:async_hooks';
import type { Database } from './db';

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

const transactions = new AsyncLocalStorage<
  ReadonlyMap<Database, Transaction>
>();

/** Resolve per async call, never mutate a shared repository's connection. */
export function resolveDatabase(database: Database): Database | Transaction {
  return transactions.getStore()?.get(database) ?? database;
}

/** Nested units use savepoints; failures propagate without automatic retries. */
export function withTransaction<T>(
  database: Database,
  work: () => Promise<T>,
): Promise<T> {
  const parent = transactions.getStore()?.get(database);
  const run = (transaction: Transaction) => {
    const scope = new Map(transactions.getStore());
    scope.set(database, transaction);
    return transactions.run(scope, work);
  };
  return parent
    ? parent.transaction(run)
    : database.transaction(run, { isolationLevel: 'serializable' });
}
