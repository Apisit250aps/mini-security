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

    const user = session?.user as
      | { id: string; isActive?: boolean }
      | undefined;
    if (!session || !user || user.isActive === false) {
      throw new UnauthorizedError('Unauthorized access');
    }

    const sessionObj = session.session as {
      activeCompanyId?: string | null;
      permissions?: string;
      memberId?: string | null;
    };
    const { actions, companyId, memberId } = await getUserPermissionActions(
      user.id,
      sessionObj.activeCompanyId,
    );
    sessionObj.permissions = actions.join(',');
    sessionObj.activeCompanyId = companyId;
    sessionObj.memberId = memberId;
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('permissions', sessionObj.permissions);
    return await next();
  },
);
