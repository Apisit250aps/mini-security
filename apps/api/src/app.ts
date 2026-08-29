import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import auth from '@repo/infrastructures/auth';
import { config } from './configs';
import { onApiError, onNotFound, success } from './lib/response';
import { authMiddleware, type AuthContext } from './middleware';
import apiRoutes from './routes';

const app = new Hono<AuthContext>();

// Request Logger
app.use(logger());

// CORS Configuration
app.use(
  '/api/*',
  cors({
    origin: config.backend.corsOrigins.split(','),
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposeHeaders: ['set-auth-token', 'set-auth-jwt'],
  }),
);

// Global Error Handler
app.onError((err, c) => onApiError(err, c));

// Global 404 Handler
app.notFound((c) => onNotFound(c));

// Better Auth Route Handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// Health Check
app.get('/', (c) => success(c, 'API is running healthy', { status: 'ok' }));

// Authenticated User Profile
app.get('/api/me', authMiddleware, (c) => {
  return success(c, 'Current user profile retrieved', {
    user: c.get('user'),
    session: c.get('session'),
  });
});

// Mount Modular API Routes
app.route('/api', apiRoutes);

export default app;
