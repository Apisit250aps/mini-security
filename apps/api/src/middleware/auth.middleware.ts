import type { MiddlewareHandler } from 'hono';
import auth from '@repo/infrastructures/auth';
import { UnauthorizedError } from '@repo/applications';
import { createMiddleware } from 'hono/factory';

export const authMiddleware: MiddlewareHandler = createMiddleware(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.raw.headers),
    });

    if (!session) {
      throw new UnauthorizedError('Unauthorized access');
    }

    c.set('user', session.user);
    c.set('session', session.session);

    return await next();
  },
);
