import type { IUnitOfWork } from '@repo/domains';
import type { Database } from '@repo/database/db';
import { withTransaction } from '@repo/database/transaction';

export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly database: Database) {}

  transaction<T>(work: () => Promise<T>): Promise<T> {
    return withTransaction(this.database, work);
  }
}
