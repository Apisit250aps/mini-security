import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from '@repo/infrastructures/auth';

const app = new Hono();

app.use(logger());
app.use(
  '/api/auth/*',
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.get('/', (c) => c.body('Hono!'));
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

export default app;
