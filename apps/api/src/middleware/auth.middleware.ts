import { getUserPermissionActions } from '@repo/infrastructures/lib/auth-permissions';
import type { MiddlewareHandler } from 'hono';
import auth from '@repo/infrastructures/auth';
import { UnauthorizedError } from '@repo/applications';
import { createMiddleware } from 'hono/factory';

export const authMiddleware: MiddlewareHandler = createMiddleware(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: new Headers(c.req.raw.headers),
      query: { disableCookieCache: true },
    });

    if (!session || !session.user.isActive) {
      throw new UnauthorizedError('Unauthorized access');
    }

    const { actions, companyId } = await getUserPermissionActions(
      session.user.id,
      session.session.activeCompanyId,
    );
    session.session.permissions = actions.join(',');
    session.session.activeCompanyId = companyId;
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('permissions', session.session.permissions);
    return await next();
  },
);
