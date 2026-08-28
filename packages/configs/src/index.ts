import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 8000,
  databaseUrl: process.env.DATABASE_URL || '',
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || '',
    url: process.env.BETTER_AUTH_URL || 'http://localhost:8000',
  },
};

export default config;
