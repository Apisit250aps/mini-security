import { defineConfig } from 'drizzle-kit';
import config from '@repo/configs';
const url = config.databaseUrl;
if (!url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url,
  },
});
