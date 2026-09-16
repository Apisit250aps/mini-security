import { DuplicateError } from '@repo/applications/lib/error';
import type { IUnitOfWork } from '@repo/domains';
import type { Database } from '@repo/database/db';
import { withTransaction } from '@repo/database/transaction';

export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly database: Database) {}

  transaction<T>(work: () => Promise<T>): Promise<T> {
    return withTransaction(this.database, work).catch((error: unknown) => {
      let cause = error;
      while (cause && typeof cause === 'object') {
        if (
          'code' in cause &&
          (cause.code === '40001' || cause.code === '40P01')
        )
          throw new DuplicateError('Concurrent update. Refresh and retry.');
        cause = 'cause' in cause ? cause.cause : null;
      }
      throw error;
    });
  }
}
