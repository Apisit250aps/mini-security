import app from '@/app';
import config from '@/configs';
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: config.backend.port,
});

console.log(`Server running at http://localhost:${config.backend.port}`);
