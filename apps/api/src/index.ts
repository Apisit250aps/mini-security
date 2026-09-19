import app from '@/app';
import config from '@/configs';
import { logger } from '@repo/configs/logger';
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: config.backend.port,
});

logger.header(
  'SECURITY PLATFORM API SERVER',
  `Server running at http://localhost:${config.backend.port} (Port: ${config.backend.port})`,
);
logger.info(
  `Ready to receive incoming requests on port ${config.backend.port}`,
  'API',
);
