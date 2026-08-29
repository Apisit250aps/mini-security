import type { MiddlewareHandler } from 'hono';
import auth from '@repo/infrastructures/auth';

export type AuthVariables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export type AuthContext = {
  Variables: AuthVariables;
};

export const authMiddleware: MiddlewareHandler<AuthContext> = async (
  c,
  next,
) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      {
        message: 'Unauthorized',
      },
      401,
    );
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
};
