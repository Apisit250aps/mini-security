import app from '@/app';
import config from '@/configs';
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: config.backendPort,
});

console.log(`Server running at http://localhost:${config.backendPort}`);
