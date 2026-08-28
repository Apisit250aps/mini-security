import { Hono } from 'hono';
import auth from '@repo/infrastructures/auth';

const app = new Hono();

app.get('/', (c) => c.body('Hono!'));
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

export default app;
