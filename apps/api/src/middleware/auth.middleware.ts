import type { MiddlewareHandler } from 'hono';
import { and, eq } from 'drizzle-orm';
import db from '@repo/database/db';
import * as schema from '@repo/database/schema';
import auth from '@repo/infrastructures/auth';
import { UnauthorizedError } from '@repo/applications';

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

export type AuthVariables = {
  user: AuthUser;
  session: AuthSession | null;
};

export type AuthContext = {
  Variables: AuthVariables;
};

/**
 * Extracts Bearer token from headers (case-insensitive)
 */
function extractBearerToken(headers: Headers): string | null {
  const authHeader =
    headers.get('authorization') ?? headers.get('Authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return authHeader.slice(7).trim() || null;
}

/**
 * Safely parse date or fallback to current date
 */
function parseDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * Maps decoded JWT payload to standard AuthUser entity
 */
function mapJwtPayloadToUser(payload: Record<string, unknown>): AuthUser {
  return {
    id: String(payload.id ?? payload.sub ?? ''),
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
    emailVerified: Boolean(payload.emailVerified),
    image: typeof payload.image === 'string' ? payload.image : null,
    createdAt: parseDate(payload.createdAt),
    updatedAt: parseDate(payload.updatedAt),
    isAdmin: Boolean(payload.isAdmin),
    isActive: payload.isActive !== false,
    lastLogin: payload.lastLogin ? parseDate(payload.lastLogin) : null,
  };
}

/**
 * Resolves authentication state via either Session (Cookie/Bearer) or JWT
 */
async function resolveAuth(
  headers: Headers,
): Promise<{ user: AuthUser; session: AuthSession | null } | null> {
  // 1. Session-based authentication (Cookie or Bearer session token)
  const session = await auth.api.getSession({ headers });
  if (session) {
    let activeCompanyId = (
      session.session as { activeCompanyId?: string | null }
    )?.activeCompanyId;

    if (!activeCompanyId && session.user.id) {
      // Heal session: auto-resolve activeCompanyId if null
      const [member] = await db
        .select({ companyId: schema.companyMember.companyId })
        .from(schema.companyMember)
        .where(
          and(
            eq(schema.companyMember.userId, session.user.id),
            eq(schema.companyMember.isActive, true),
          ),
        )
        .limit(1);

      if (member?.companyId) {
        activeCompanyId = member.companyId;
      } else if (session.user.isAdmin) {
        const [firstCompany] = await db
          .select({ id: schema.company.id })
          .from(schema.company)
          .where(eq(schema.company.isActive, true))
          .limit(1);
        if (firstCompany?.id) {
          activeCompanyId = firstCompany.id;
        }
      }

      if (activeCompanyId) {
        (
          session.session as { activeCompanyId?: string | null }
        ).activeCompanyId = activeCompanyId;
        await db
          .update(schema.session)
          .set({ activeCompanyId })
          .where(eq(schema.session.id, session.session.id));
      }
    }

    return {
      user: session.user,
      session: session.session,
    };
  }

  // 2. JWT-based authentication (Stateless Bearer JWT)
  const token = extractBearerToken(headers);
  if (token) {
    try {
      const result = await auth.api.verifyJWT({ body: { token } });
      if (result?.payload) {
        return {
          user: mapJwtPayloadToUser(result.payload),
          session: null,
        };
      }
    } catch {
      // Token verification failed or expired
    }
  }

  return null;
}

export const authMiddleware: MiddlewareHandler<AuthContext> = async (
  c,
  next,
) => {
  const authState = await resolveAuth(c.req.raw.headers);

  if (!authState) {
    throw new UnauthorizedError('Unauthorized access');
  }

  c.set('user', authState.user);
  c.set('session', authState.session);

  return await next();
};
