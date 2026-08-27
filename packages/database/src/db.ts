import { drizzle } from 'drizzle-orm/node-postgres';
import { relations } from './relations';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = drizzle(url, { relations: { ...relations }, logger: true });

type Database = typeof db;

export type { Database };
export default db;
