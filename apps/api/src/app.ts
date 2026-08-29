import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from '@repo/infrastructures/auth';
import { config } from './configs';
import { authMiddleware, type AuthContext } from './middleware';

const app = new Hono<AuthContext>();
app.use(logger());
app.use(
  '/api/*',
  cors({
    origin: config.backend.corsOrigins.split(','),
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposeHeaders: ['set-auth-jwt'],
  }),
);

app.get('/', (c) => c.body('Hono!'));
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/api/me', authMiddleware, (c) => {
  const user = c.get('user');
  const session = c.get('session');
  return c.json({
    user,
    session,
  });
});

export default app;
