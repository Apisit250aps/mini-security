import { config } from '@repo/configs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

let url = config.databaseUrl || process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

if (!url.includes('timezone=')) {
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}options=-c%20timezone=UTC`;
}

const db = drizzle(url, { relations: { ...relations }, logger: true });

type Database = typeof db;

export type { Database };
export default db;
