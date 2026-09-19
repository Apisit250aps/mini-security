import { config } from '@repo/configs';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Logger } from 'drizzle-orm';
import { relations } from './relations';

let url = config.databaseUrl || process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (!url.includes('timezone=')) {
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}options=-c%20timezone=UTC`;
}

class DatabaseLogger implements Logger {
  private readonly enabled: boolean;

  constructor({ enabled }: { enabled: boolean }) {
    this.enabled = enabled;
  }

  logQuery(query: string): void {
    if (!this.enabled) return;
    const operation = query.trim().split(/\s+/u)[0]?.toUpperCase() ?? 'SQL';
    if (!['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(operation)) return;

    const table =
      query.match(/\b(?:FROM|INTO|UPDATE|JOIN)\s+"?([\w.]+)"?/iu)?.[1] ??
      'unknown';
    config.logger.debug(`${operation} ${table}`.trim(), 'DB');
  }
}

const loggedDb = drizzle(url, {
  relations: { ...relations },
  logger: new DatabaseLogger({ enabled: !true }),
});

type Database = typeof loggedDb;

export type { Database };
export default loggedDb;
